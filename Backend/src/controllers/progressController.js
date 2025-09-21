import Interaction from '../models/Interaction.js';
import User from '../models/User.js'; // <-- Import the User model
import mongoose from 'mongoose';

/**
 * @desc    Get progress analytics for all linked students.
 * @route   GET /api/progress/analytics
 */
export const getProgressAnalytics = async (req, res, next) => {
    try {
        const caregiver = await User.findById(req.user._id);
        const studentIds = caregiver.students;

        // --- Metric 1: Get the total number of interactions ---
        const totalInteractions = await Interaction.countDocuments({ user: { $in: studentIds } });

        // --- Metric 2: Get emotion distribution ---
        const emotionDistribution = await Interaction.aggregate([
            { $match: { user: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) } } },
            { $group: { _id: '$detectedEmotion', count: { $sum: 1 } } },
            { $project: { _id: 0, emotion: '$_id', count: '$count' } }
        ]);

        // --- Metric 3: Get interaction trends over the last 7 days ---
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const interactionTrend = await Interaction.aggregate([
            { $match: { user: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) }, createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: '$_id', count: '$count' } }
        ]);
        
        res.json({
            totalInteractions,
            emotionDistribution,
            interactionTrend,
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all interactions for the caregiver's linked students.
 * @route   GET /api/progress/history
 */
export const getInteractionHistory = async (req, res, next) => {
    try {
        const caregiver = await User.findById(req.user._id);
        if (!caregiver) {
            res.status(404);
            throw new Error('Caregiver not found');
        }

        const studentIds = caregiver.students;

        // Find all interactions where the 'user' is one of the linked students
        const interactions = await Interaction.find({ user: { $in: studentIds } })
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('user', 'name'); // Also include the student's name in the result

        res.json(interactions);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get topic distribution for all linked students.
 * @route   GET /api/progress/topics
 */
export const getTopicAnalytics = async (req, res, next) => {
    try {
        const caregiver = await User.findById(req.user._id);
        const studentIds = caregiver.students;

        const topicDistribution = await Interaction.aggregate([
            { $match: { user: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) } } },
            { $group: { _id: '$topic', count: { $sum: 1 } } },
            { $project: { _id: 0, name: '$_id', value: '$count' } }
        ]);
        res.json(topicDistribution);
    } catch (error) {
        next(error);
    }
};