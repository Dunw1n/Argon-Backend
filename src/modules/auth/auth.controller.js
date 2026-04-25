// src/modules/auth/auth.controller.js
import { validationResult } from 'express-validator';
import authService from './auth.service.js';

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { email, password, name } = req.body;
      const result = await authService.register({ email, password, name });
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Register error:', error);
      res.status(400).json({ error: error.message });
    }
  }
  
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  }
  
  async verifyPin(req, res) {
    try {
      const { userId, pinCode } = req.body;
      
      if (!userId || !pinCode) {
        return res.status(400).json({ error: 'User ID and PIN code are required' });
      }
      
      const result = await authService.verifyPin(userId, pinCode);
      res.json(result);
    } catch (error) {
      console.error('Verify PIN error:', error);
      
      if (error.message === 'Неверный PIN-код') {
        return res.status(401).json({ error: error.message });
      }
      if (error.message === 'PIN-код истек. Запросите новый') {
        return res.status(410).json({ error: error.message });
      }
      
      res.status(400).json({ error: error.message });
    }
  }
  
  async resendPin(req, res) {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const result = await authService.resendPin(userId);
      res.json(result);
    } catch (error) {
      console.error('Resend PIN error:', error);
      res.status(400).json({ error: error.message });
    }
  }
  
  async getMe(req, res) {
    try {
      res.json(req.user);
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new AuthController();