// Backend/src/services/notificationService.js

import cron from 'node-cron';
import User from '../models/User.js';
// Note: You will need to create and export this function from your gcalendarService
import { getUpcomingEvents } from './gcalendarService.js'; 

export const start = (io, connectedUsers) => {
  // Schedule a task to run every minute
  cron.schedule('* * * * *', async () => {
    console.log('Checking for upcoming tasks...');

    const students = await User.find({ role: 'student' });

    for (const student of students) {
      if (connectedUsers[student._id]) {
        try {
          // This function needs to be implemented in gcalendarService.js
          // It should fetch upcoming calendar events for a given user.
          const events = await getUpcomingEvents(student.googleId); 
          
          if (events && events.length > 0) {
            const now = new Date();
            for (const event of events) {
              const eventStartTime = new Date(event.start.dateTime);
              const diffInMinutes = (eventStartTime - now) / (1000 * 60);

              // Notify if the event is within the next 15 minutes
              if (diffInMinutes > 0 && diffInMinutes <= 15) {
                const message = `You have an upcoming task: ${event.summary} at ${eventStartTime.toLocaleTimeString()}`;
                const socketId = connectedUsers[student._id];
                io.to(socketId).emit('notification', { message });
                console.log(`Sent notification to ${student.name}: ${message}`);
              }
            }
          }
        } catch (error) {
          console.error(`Failed to check calendar for user ${student._id}:`, error);
        }
      }
    }
  });
};