
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js';
import pollRoutes from './routes/poll.routes.js';
import { registerWSServer } from './controllers/poll.controller.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
export const prisma = new PrismaClient();

// Setup WebSocket Server
const wss = new WebSocketServer({ server });
registerWSServer(wss); // Register the WebSocket server instance

// Middleware
app.use(express.json());
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Move37 Polling API! Server is running.' });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/polls', pollRoutes);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});