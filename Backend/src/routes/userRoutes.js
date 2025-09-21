// src/routes/userRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    linkStudent,
    getLinkedStudents,
    getUserProfile,
    getStudentSettings,     // <-- Import new function
    updateStudentSettings   // <-- Import new function
} from '../controllers/userController.js';

const router = express.Router();
router.use(protect);

router.route('/profile').get(getUserProfile);

// --- Updated Route ---
// This route now accepts a studentId parameter
router.route('/settings/:studentId')
    .get(getStudentSettings)
    .put(updateStudentSettings);

router.route('/students')
    .post(linkStudent)
    .get(getLinkedStudents);

export default router;