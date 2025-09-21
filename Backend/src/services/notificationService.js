import cron from 'node-cron';
import User from '../models/User.js'; // Adjust path if needed
import { getUpcomingEvents } from './gcalendarService.js'; // We'll assume this function exists
import { textToSpeech } from './ttsService.js'; // And this one too

let io;
let activeUsers;

/**
 * Initializes the notification service with the Socket.IO instance and active users object.
 * @param {object} socketIoInstance The main Socket.IO server instance.
 * @param {object} usersObject The object mapping user IDs to socket IDs.
 */
export const init = (socketIoInstance, usersObject) => {
    io = socketIoInstance;
    activeUsers = usersObject;
    
    // Schedule a cron job to run every minute to check for tasks.
    cron.schedule('* * * * *', checkUpcomingTasks);
    console.log('Notification service scheduled: Checking for tasks every minute.');
};

/**
 * Checks for upcoming tasks for all students and sends notifications.
 */
const checkUpcomingTasks = async () => {
    try {
        // Find all users who are students
        const students = await User.find({ role: 'student' });

        for (const student of students) {
            // Check if this student is currently online
            const studentSocketId = activeUsers[student._id.toString()];
            
            if (studentSocketId) {
                // Fetch events scheduled to start in the next 15 minutes
                const events = await getUpcomingEvents(student.googleCalendarId); // You'll need to implement or adjust this
                if (!events || events.length === 0) continue;

                for (const event of events) {
                    const now = new Date();
                    const eventStartTime = new Date(event.start.dateTime || event.start.date);
                    const timeDiffMinutes = (eventStartTime - now) / 1000 / 60;

                    // Send a notification if the task is 15 minutes away
                    if (timeDiffMinutes > 14 && timeDiffMinutes <= 15) {
                        const notificationText = `Reminder: Your task "${event.summary}" starts in about 15 minutes.`;
                        
                        const audioBuffer = await textToSpeech(notificationText);

                        // Emit notification directly to the specific user's socket
                        io.to(studentSocketId).emit('taskNotification', {
                            message: notificationText,
                            audio: audioBuffer,
                        });
                        console.log(`Sent task notification for "${event.summary}" to student ${student._id}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error during notification check:', error);
    }
};