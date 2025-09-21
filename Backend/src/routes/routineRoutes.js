import express from 'express';
import { getRoutine, addRoutineItem, deleteRoutineItem } from '../controllers/routineController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply the 'protect' middleware to all routes defined in this file.
// This ensures that only authenticated caregivers can manage the routine.
router.use(protect);

// Define routes for the base '/api/routine' path
router.route('/')
    .get(getRoutine)       // GET request to fetch the routine
    .post(addRoutineItem);  // POST request to add a new item

// Define routes for paths with an ID, e.g., '/api/routine/someEventId'
router.route('/:id')
    .delete(deleteRoutineItem); // DELETE request to remove an item

export default router;