// src/models/Content.js
import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Language', 'Mathematics', 'Social Skills', 'Self-care'],
    },
    content_type: {
        type: String,
        required: true,
        enum: ['Lesson', 'Activity', 'Story'],
    },
    body: { // The main text or instructions for the content
        type: String,
        required: true,
    },
    // Link this content to the caregiver who created it
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Content = mongoose.model('Content', contentSchema);
export default Content;