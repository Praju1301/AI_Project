import Routine from '../models/Routine.js';
import Task from '../models/Task.js';

// --- Routine Controllers ---
export const getRoutineForStudent = async (req, res, next) => {
    try {
        const routine = await Routine.findOne({ student: req.params.studentId });
        res.json(routine || { student: req.params.studentId, items: [] });
    } catch (error) { next(error); }
};

export const setRoutineForStudent = async (req, res, next) => {
    try {
        const { title, items } = req.body;
        const routine = await Routine.findOneAndUpdate(
            { student: req.params.studentId, createdBy: req.user._id },
            { title, items, student: req.params.studentId, createdBy: req.user._id },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.status(201).json(routine);
    } catch (error) { next(error); }
};

// --- Task Controllers ---
export const getTasksForStudent = async (req, res, next) => {
    try {
        const tasks = await Task.find({ assignedTo: req.params.studentId });
        res.json(tasks);
    } catch (error) { next(error); }
};

export const createTaskForStudent = async (req, res, next) => {
    try {
        const { title, description, startTime, endTime } = req.body;
        const studentId = req.params.studentId;

        const task = new Task({
            title, description, startTime, endTime,
            assignedTo: studentId,
            createdBy: req.user._id
        });
        const createdTask = await task.save();

        // --- Send Notification via Socket.IO ---
        const { io, activeUsers } = req;
        const studentSocketId = activeUsers[studentId];

        if (studentSocketId) {
            io.to(studentSocketId).emit('new_task', {
                title: createdTask.title,
                startTime: createdTask.startTime
            });
            console.log(`Notification for new task sent to student ${studentId}`);
        }
        // --- End Notification Logic ---

        res.status(201).json(createdTask);
    } catch (error) { next(error); }
};