import { Router } from 'express';
import { body } from 'express-validator';
import authController from './auth.controller.js';
import { authMiddleware } from '../../shared/middleware/index.js';

const router = Router();

// Валидация
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// Публичные роуты
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/verify-pin', authController.verifyPin);
router.post('/resend-pin', authController.resendPin);

// Защищенные роуты
router.get('/me', authMiddleware, authController.getMe);

export default router;