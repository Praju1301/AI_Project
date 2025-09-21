import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { processInteraction } from '../controllers/interactionController.js';   

const router = express.Router();

// Initialize Multer for file uploads
const upload = multer({ dest: 'uploads/' });

/**
 * @desc    Process a user's audio input, get an AI response, and save the interaction.
 * @route   POST /api/interact
 * @access  Private (requires authentication)
 */
router.route('/').post(protect, upload.single('audio'), processInteraction);


export default router;
