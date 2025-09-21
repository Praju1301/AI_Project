// src/routes/scheduleRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    getRoutineForStudent, setRoutineForStudent, 
    getTasksForStudent, createTaskForStudent 
} from '../controllers/scheduleController.js';

const router = express.Router();
router.use(protect);

// Routes for a specific student's routine
router.route('/routine/:studentId')
    .get(getRoutineForStudent)
    .post(setRoutineForStudent);

// Routes for a specific student's tasks
router.route('/tasks/:studentId')
    .get(getTasksForStudent)
    .post(createTaskForStudent);

export default router;