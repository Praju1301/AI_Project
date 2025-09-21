// Import and configure dotenv FIRST
import dotenv from 'dotenv';
dotenv.config();

// Now, import other packages
import express from 'express';
import cors from 'cors';
import http from 'http'; // Import the http module
import { Server } from 'socket.io'; // Import the Server class

// Import local modules
import connectDB from './src/config/db.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';

// Import Routers
import authRoutes from './src/routes/authRoutes.js';
import interactionRoutes from './src/routes/interactionRoutes.js';
import routineRoutes from './src/routes/routineRoutes.js';
import progressRoutes from './src/routes/progressRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import contentRoutes from './src/routes/contentRoutes.js';
import scheduleRoutes from './src/routes/scheduleRoutes.js';

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

// --- Create HTTP and Socket.IO Servers ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow your frontend to connect
        methods: ["GET", "POST"]
    }
});

// --- Store active users ---
let activeUsers = {}; // Maps userId to socketId

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('addUser', (userId) => {
        activeUsers[userId] = socket.id;
        console.log('Active users:', activeUsers);
    });

    socket.on('disconnect', () => {
        for (let userId in activeUsers) {
            if (activeUsers[userId] === socket.id) {
                delete activeUsers[userId];
                break;
            }
        }
        console.log('A user disconnected. Active users:', activeUsers);
    });
});

// Make the io instance and activeUsers available to the rest of the app
app.use((req, res, next) => {
    req.io = io;
    req.activeUsers = activeUsers;
    next();
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/interact', interactionRoutes);
app.use('/api/routine', routineRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/user', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/schedule', scheduleRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('Sathi API is running...');
});

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
// Listen on the 'server' instance, not the 'app' instance
server.listen(PORT, () => {
    console.log(`Server running with real-time support on port ${PORT}`);
});