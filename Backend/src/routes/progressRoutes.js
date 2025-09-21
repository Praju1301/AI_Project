// src/routes/progressRoutes.js
import express from 'express';
// Import the new controller function
import { getProgressAnalytics, getInteractionHistory, getTopicAnalytics } from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.route('/analytics').get(getProgressAnalytics);
router.route('/history').get(getInteractionHistory);
router.route('/topics').get(getTopicAnalytics); // <-- Add this new route

export default router;