import jwt from 'jsonwebtoken';
import { configApp } from '../../config/configApp.js';

export const generateToken = (payload) => {
  // Убеждаемся, что в payload есть userId
  const tokenPayload = {
    userId: payload.userId || payload.id,
    email: payload.email,
  };
  
  return jwt.sign(tokenPayload, configApp.JWT_SECRET, {
    expiresIn: configApp.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, configApp.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};