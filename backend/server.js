import 'dotenv/config';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cors from 'cors';
import mongoose from 'mongoose';
import documentsRouter from './routes/documents.js';
import agentsRouter from './routes/agents.js';
import vivaRouter from './routes/viva.js';
import mockExamRouter from './routes/mock-exam.js';
import authRouter from './routes/auth.js';
import workspaceRouter from './routes/workspace.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[SERVER INCOMING] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/workspaces', workspaceRouter);
app.use('/api/workspaces/:workspaceId/documents', documentsRouter);
app.use('/api/workspaces/:workspaceId/agents', agentsRouter);
app.use('/api/workspaces/:workspaceId/viva', vivaRouter);
app.use('/api/workspaces/:workspaceId/mock-exam', mockExamRouter);

// Health Handshake Verification
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Database connection
const startServer = async () => {
  try {
    let MONGODB_URI = process.env.MONGODB_URI;
    
    if (process.env.DEMO_MODE === 'true') {
      console.log('[DEMO MODE] Spinning up local MongoMemoryServer...');
      const mongoServer = await MongoMemoryServer.create();
      MONGODB_URI = mongoServer.getUri();
    } else {
      MONGODB_URI = MONGODB_URI || 'mongodb://localhost:27017/academic-agent';
    }

    await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB connected successfully to ${process.env.DEMO_MODE === 'true' ? 'MemoryServer' : 'Atlas'}`);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
