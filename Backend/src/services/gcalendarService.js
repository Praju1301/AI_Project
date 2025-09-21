// src/services/gcalendarService.js
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import fs from 'fs';

const getCalendar = () => {
    // Check if the credentials file exists before trying to read it
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        console.warn(`Google credentials file not found at: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
        return null; // Return null if credentials aren't available
    }
    const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS));
    
    const auth = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    return google.calendar({ version: 'v3', auth });
};

/**
 * Fetches upcoming events from the primary Google Calendar.
 * @returns {Promise<Array>} A promise that resolves to a list of upcoming events.
 */
export const getCalendarEvents = async () => {
    try {
        const calendar = getCalendar();
        if (!calendar) {
            console.warn('Google Calendar client not available - skipping calendar events');
            return []; // Return empty array if calendar client is not available
        }

        const res = await calendar.events.list({
            calendarId: 'primary', // 'primary' refers to the main calendar
            timeMin: new Date().toISOString(), // Start from the current time
            maxResults: 10, // Get up to 10 upcoming events
            singleEvents: true,
            orderBy: 'startTime', // Order events by their start time
        });
        return res.data.items || [];
    } catch (error) {
        console.error('Error fetching calendar events:', error.message);
        return []; // Return an empty array on failure
    }
};

/**
 * Adds a new event (routine item) to the Google Calendar.
 * @param {object} eventDetails - Contains summary, description, startDateTime, and endDateTime.
 * @returns {Promise<object>} A promise that resolves to the newly created event data.
 */
export const addCalendarEvent = async (eventDetails) => {
    const calendar = getCalendar();
    if (!calendar) {
         throw new Error('Google Calendar client is not available.');
    }
    try {
        // --- START of FIX ---
        // If a student's email is provided, add it to the summary.
        // Otherwise, use the original summary.
        const eventSummary = eventDetails.studentEmail 
            ? `${eventDetails.summary} (for ${eventDetails.studentEmail})` 
            : eventDetails.summary;

        const event = {
            summary: eventSummary, // Use the new summary
            description: eventDetails.description,
            start: { dateTime: eventDetails.startDateTime, timeZone: 'Asia/Kolkata' },
            end: { dateTime: eventDetails.endDateTime, timeZone: 'Asia/Kolkata' },
            // We are no longer using the attendees field
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });
        return response.data;
    } catch (error) {
        console.error('Error adding calendar event:', error);
        throw new Error('Could not create routine event.');
    }
};

/**
 * Deletes an event from the Google Calendar.
 * @param {string} eventId - The unique ID of the event to delete.
 * @returns {Promise<object>} A promise that resolves to a success message.
 */
export const deleteCalendarEvent = async (eventId) => {
    const calendar = getCalendar();
    if (!calendar) {
        throw new Error('Google Calendar service is not available. Please check your credentials.');
    }

    try {
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });
        return { message: 'Event deleted successfully.' };
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        throw new Error('Could not delete routine event.');
    }
};
export const getUpcomingEvents = async (calendarId = 'primary') => {
    try {
        const now = new Date();
        const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);

        const response = await calendar.events.list({
            calendarId,
            timeMin: now.toISOString(),
            timeMax: fifteenMinutesLater.toISOString(),
            maxResults: 5,
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.data.items;
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        return [];
    }
};