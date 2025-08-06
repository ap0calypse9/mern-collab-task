const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    }
});

// Store online sockets in memory (for now)
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('⚡ New client connected:', socket.id);

    socket.on('joinTaskRoom', (taskId) => {
        socket.join(taskId);
    });

    socket.on('sendComment', ({ taskId, comment }) => {
        io.to(taskId).emit('newComment', comment);
    });

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/project'));
app.use('/api/tasks', require('./routes/task'));
app.use('/api/comments', require('./routes/comment')); // next step

// DB + Start
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        server.listen(process.env.PORT || 5000, () => {
            console.log('🚀 Server running on port', process.env.PORT || 5000);
        });
    })
    .catch((err) => console.error('MongoDB error:', err));
