import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const configApp = {
  // Сервер
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // PostgreSQL - для обратной совместимости с локальной разработкой
  // НО на Render будет использоваться DATABASE_URL вместо этих настроек
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'argon',
  DB_USER: process.env.DB_USER || 'argon',
  DB_PASSWORD: process.env.DB_PASSWORD || 'argon123',
  
  // Для Render: полная строка подключения (если есть)
  DATABASE_URL: process.env.DATABASE_URL || null,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:8081',
  
  // Email
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  
  // Uploads
  UPLOAD_DIR: path.join(__dirname, '../../uploads'),
};