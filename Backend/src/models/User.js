import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the schema for the User collection
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Emails must be unique
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['caregiver', 'student'], // Restrict roles to these two values
        required: true,
    },
    // For caregivers, this will be an array of student IDs
    // For students, this can be empty
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    settings: {
        voice: { type: String, default: 'Default' },
        responseSpeed: { type: String, default: 'normal' }
    }
}, {
    timestamps: true,
});
// Middleware that runs *before* a new user document is saved to the database
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    // Generate a "salt" to add randomness to the hash
    const salt = await bcrypt.genSalt(10);
    // Hash the password and replace the plain text password with the hash
    this.password = await bcrypt.hash(this.password, salt);
});

// Add a custom method to the User model to compare passwords during login
userSchema.methods.matchPassword = async function (enteredPassword) {
    // Use bcrypt to compare the plain text password with the stored hash
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create the Mongoose model from the schema
const User = mongoose.model('User', userSchema);
export default User;