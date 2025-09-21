import express from 'express';
import { getNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// The route uses the imported controller function
router.get('/', protect, getNotification);

// Exporting the router as the default module export
export default router;