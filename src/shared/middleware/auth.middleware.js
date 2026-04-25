// src/shared/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import { User } from '../../modules/index.js';
import { configApp } from '../../config/configApp.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, configApp.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'pin_code', 'pin_code_expires'] }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

export { authMiddleware };
export default authMiddleware;