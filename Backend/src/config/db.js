// Import the Mongoose library, which simplifies working with MongoDB
import mongoose from 'mongoose';

/**
 * Establishes a connection to the MongoDB database using the connection string
 * provided in the .env file.
 */
const connectDB = async () => {
    try {
        // Attempt to connect to the database using the URI from environment variables
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        // If the connection is successful, log a confirmation message to the console
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // If the connection fails, log the error message
        console.error(`Error connecting to MongoDB: ${error.message}`);
        
        // Exit the Node.js process with a failure code (1) to indicate a critical error
        process.exit(1);
    }
};

// Export the function to be used in the main index.js file
export default connectDB;