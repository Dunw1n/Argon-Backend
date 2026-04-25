import rateLimit from 'express-rate-limit';
import { configApp } from '../../config/configApp.js';

export const authLimiter = rateLimit({
  windowMs: configApp.RATE_LIMIT_WINDOW_MS,
  max: configApp.RATE_LIMIT_MAX,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 60, // 60 запросов в минуту
  message: { error: 'Too many requests, please try again later' },
});