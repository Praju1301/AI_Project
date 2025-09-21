import {
    getCalendarEvents,
    addCalendarEvent,
    deleteCalendarEvent
} from '../services/gcalendarService.js';

/**
 * @desc    Get all upcoming routine events.
 * - If user is a caregiver, returns all events.
 * - If user is a student, returns only events assigned to them.
 * @route   GET /api/routine
 */
export const getRoutine = async (req, res, next) => {
    try {
        console.log('--- Fetching Routine ---');
        console.log('User Role:', req.user.role);
        console.log('User Email:', req.user.email);

        const allEvents = await getCalendarEvents();
        console.log(`Found ${allEvents.length} total events in the calendar.`);

        if (req.user.role === 'student') {
            const studentEmail = req.user.email;
            console.log(`Filtering for student with email: ${studentEmail}`);

            const studentEvents = allEvents.filter(event => {
                const summary = event.summary || '';
                const isMatch = summary.includes(`(for ${studentEmail})`);
                // Log each event being checked
                console.log(`- Checking event: "${summary}". Match: ${isMatch}`);
                return isMatch;
            });
            
            console.log(`Found ${studentEvents.length} events for this student.`);
            res.json(studentEvents);
        } else {
            console.log('User is a caregiver, returning all events.');
            res.json(allEvents);
        }
    } catch (error) {
        next(error);
    }
};

// ... (keep the addRoutineItem and deleteRoutineItem functions exactly the same)
export const addRoutineItem = async (req, res, next) => {
    try {
        const { summary, description, startDateTime, endDateTime, studentEmail } = req.body;
        
        if (!summary || !startDateTime || !endDateTime) {
            res.status(400);
            throw new Error('Missing required fields for routine item.');
        }
        
        const newEvent = await addCalendarEvent({ 
            summary, 
            description, 
            startDateTime, 
            endDateTime,
            studentEmail
        });
        res.status(201).json(newEvent);
    } catch (error) {
        next(error);
    }
};

export const deleteRoutineItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteCalendarEvent(id);
        res.json({ message: 'Routine item deleted successfully.' });
    } catch (error) {
        next(error);
    }
};