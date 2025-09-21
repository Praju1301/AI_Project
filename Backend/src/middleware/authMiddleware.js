import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes by verifying a JWT.
 * If the token is valid, it attaches the user's data to the request object.
 * If not, it returns an authorization error.
 */
export const protect = async (req, res, next) => {
    let token;

    // Check if the 'Authorization' header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the header (e.g., "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];
            
            // Verify the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find the user by the ID stored in the token and attach it to the request.
            // Exclude the password field for security.
            req.user = await User.findById(decoded.id).select('-password');
            
            // Proceed to the next middleware or the route's controller
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    // If no token is found in the header, return an error
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
};