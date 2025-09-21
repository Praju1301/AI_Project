// src/models/Routine.js
import mongoose from 'mongoose';

const routineItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // --- Start of Change ---
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    // --- End of Change ---
    isCompleted: { type: Boolean, default: false }
});

const routineSchema = new mongoose.Schema({
    title: { type: String, required: true, default: 'Daily Routine' },
    items: [routineItemSchema],
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true });

const Routine = mongoose.model('Routine', routineSchema);
export default Routine;