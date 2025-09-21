// src/controllers/contentController.js
import Content from '../models/Content.js';

// @desc    Get all content created by a caregiver
// @route   GET /api/content
export const getContent = async (req, res, next) => {
    try {
        const content = await Content.find({ createdBy: req.user._id });
        res.json(content);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new piece of content
// @route   POST /api/content
export const createContent = async (req, res, next) => {
    try {
        const { title, category, content_type, body } = req.body;
        const content = new Content({
            title,
            category,
            content_type,
            body,
            createdBy: req.user._id
        });
        const createdContent = await content.save();
        res.status(201).json(createdContent);
    } catch (error) {
        next(error);
    }
};