// src/controllers/userController.js
import User from '../models/User.js';

/**
 * @desc    Get the settings for the logged-in user.
 * @route   GET /api/user/settings
 */
// --- Start of New/Updated Functions ---
/**
 * @desc    Get the settings for a specific student.
 * @route   GET /api/user/settings/:studentId
 */
export const getStudentSettings = async (req, res, next) => {
    try {
        const caregiver = await User.findById(req.user._id);
        const { studentId } = req.params;

        // Security check: Ensure the student is linked to this caregiver
        if (!caregiver.students.includes(studentId)) {
            res.status(403);
            throw new Error("You are not authorized to view this student's settings.");
        }

        const student = await User.findById(studentId);
        if (student) {
            res.json(student.settings);
        } else {
            res.status(404);
            throw new Error('Student not found');
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update the settings for a specific student.
 * @route   PUT /api/user/settings/:studentId
 */
export const updateStudentSettings = async (req, res, next) => {
    try {
        const caregiver = await User.findById(req.user._id);
        const { studentId } = req.params;

        // Security check
        if (!caregiver.students.includes(studentId)) {
            res.status(403);
            throw new Error("You are not authorized to change this student's settings.");
        }

        const student = await User.findById(studentId);
        if (student) {
            student.settings.voice = req.body.voice || student.settings.voice;
            student.settings.responseSpeed = req.body.responseSpeed || student.settings.responseSpeed;

            const updatedStudent = await student.save();
            res.json(updatedStudent.settings);
        } else {
            res.status(404);
            throw new Error('Student not found');
        }
    } catch (error) {
        next(error);
    }
};
/**
 * @desc    Link a student to the logged-in caregiver using the student's email.
 * @route   POST /api/user/students
 */
export const linkStudent = async (req, res, next) => {
    try {
        const caregiver = await User.findById(req.user._id);
        // We now expect studentEmail from the frontend
        const { studentEmail } = req.body;

        if (caregiver.role !== 'caregiver') {
            res.status(403); // Forbidden
            throw new Error('Only caregivers can link students.');
        }

        // Find the student in the database by their email
        const student = await User.findOne({ email: studentEmail });

        if (!student || student.role !== 'student') {
            res.status(404);
            throw new Error('No student found with this email, or the user is not a student.');
        }

        // Get the student's ID from the user object we found
        const studentId = student._id;

        // Add student's ID to caregiver's list if not already present
        if (!caregiver.students.includes(studentId)) {
            caregiver.students.push(studentId);
            await caregiver.save();
        }

        res.status(200).json({ message: 'Student linked successfully.' });
    } catch (error) {
        next(error);
    }
};
/**
 * @desc    Get all students linked to the logged-in caregiver.
 * @route   GET /api/user/students
 */
export const getLinkedStudents = async (req, res, next) => {
    try {
        if (req.user.role !== 'caregiver') {
            res.status(403);
            throw new Error('Only caregivers can view students.');
        }

        // Find the caregiver and populate the 'students' field with full user details
        const caregiver = await User.findById(req.user._id).populate('students', 'name email');

        if (!caregiver) {
            res.status(404);
            throw new Error('Caregiver not found.');
        }

        res.json(caregiver.students);
    } catch (error) {
        next(error);
    }
};

export const getUserProfile = async (req, res, next) => {
    try {
        // req.user is populated by the 'protect' middleware
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};