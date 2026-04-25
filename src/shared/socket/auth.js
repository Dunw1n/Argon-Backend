import jwt from 'jsonwebtoken';
import { User } from '../../modules/index.js';
import { configApp } from '../../config/configApp.js';

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    const decoded = jwt.verify(token, configApp.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'name']
    });
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};