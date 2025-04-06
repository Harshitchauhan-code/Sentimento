const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Agent = require('./models/Agent');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  }
});

// Store active user connections
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  // Authenticate socket connection
  socket.use(async ([event, ...args], next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const agent = await Agent.findById(decoded.id).select('+active');
      
      if (!agent || !agent.active) {
        return next(new Error('Account is inactive'));
      }
      
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  socket.on('join', (userId) => {
    console.log('User joined:', userId);
    socket.userId = userId;
    userSockets.set(userId, socket.id);
  });

  socket.on('error', (error) => {
    if (error.message === 'Authentication required' || error.message === 'Account is inactive') {
      socket.disconnect(true);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

// Make io accessible to routes
app.set('io', io);
app.set('userSockets', userSockets);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectDB, 5000);
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Ensure MongoDB disconnects properly when the server stops
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sentiment', authenticateToken, require('./routes/sentimentRoutes'));
app.use('/api/agents', require('./routes/agentRoutes'));
app.use('/api/analysis-history', authenticateToken, require('./routes/analysisHistoryRoutes'));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 