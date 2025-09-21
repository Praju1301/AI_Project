import jwt from 'jsonwebtoken';

/**
 * Creates a JSON Web Token (JWT) signed with a secret key.
 * @param {string} id - The user's unique ID from the database.
 * @returns {string} The generated JWT.
 */
const generateToken = (id) => {
    // Use the user's ID as the payload and sign it with the secret from .env
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // The token will be valid for 30 days
    });
};

export default generateToken;