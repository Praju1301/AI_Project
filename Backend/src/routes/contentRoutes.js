// src/routes/contentRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getContent, createContent } from '../controllers/contentController.js';

const router = express.Router();

// All routes require a logged-in user (caregiver)
router.use(protect);

router.route('/')
    .get(getContent)
    .post(createContent);

export default router;