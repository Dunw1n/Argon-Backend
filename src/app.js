import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { configApp } from './config/configApp.js';
import initDatabase from './shared/database/init.js';

import { authMiddleware } from './shared/middleware/auth.middleware.js';
import { updateLastSeen } from './shared/middleware/updateLastSeen.middleware.js';

import { socketAuth } from './shared/socket/auth.js';
import { setupSocketHandlers } from './shared/socket/socket.handlers.js';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import chatRoutes from './modules/chats/chat.routes.js';
import messageRoutes from './modules/messages/message.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: configApp.FRONTEND_URL,
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.use(socketAuth);

setupSocketHandlers(io);

app.set('io', io);

app.use(cors({
  origin: configApp.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (configApp.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`);
    next();
  });
}

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRoutes);

app.use('/api/users', authMiddleware, updateLastSeen, userRoutes);
app.use('/api/chats', authMiddleware, updateLastSeen, chatRoutes);
app.use('/api/chats/:chatId/messages', authMiddleware, updateLastSeen, messageRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Max size 5MB' });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: configApp.NODE_ENV === 'development' ? err.message : undefined
  });
});

const startServer = async () => {
  try {
    await initDatabase();
    
    server.listen(configApp.PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🚀 Argon Messenger Server                      ║
║                                                  ║
║   📡 Port: ${configApp.PORT}                                  ║
║   🌍 Environment: ${configApp.NODE_ENV}                    ║
║   🔌 WebSocket: ws://localhost:${configApp.PORT}              ║
║                                                  ║
╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();

export default app;