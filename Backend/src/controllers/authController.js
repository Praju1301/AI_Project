// src/controllers/authController.js
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user in the database.
 * @route   POST /api/auth/register
 */
export const registerUser = async (req, res, next) => {
    try {
        // Destructure name, email, password, AND role from the request body
        const { name, email, password, role } = req.body;

        // Basic validation
        if (!role || !['caregiver', 'student'].includes(role)) {
            res.status(400);
            throw new Error('A valid role (\'caregiver\' or \'student\') is required.');
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Create a new user with the specified role
        const user = await User.create({ name, email, password, role });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role, // <-- Send role back
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Authenticate a user and get a token (Login).
 * @route   POST /api/auth/login
 */
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role, // <-- Send role back
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};