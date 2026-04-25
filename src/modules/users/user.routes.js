// routes/userRoutes.js
import { Router } from 'express';
import userController from './user.controller.js';
import { authMiddleware } from '../../shared/middleware/index.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем директорию для аватаров
const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка multer для загрузки аватаров
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Разрешены только изображения (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

const router = Router();

// Все роуты требуют аутентификации
router.use(authMiddleware);

// Профиль
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);

// Аватар
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);
router.delete('/avatar', userController.deleteAvatar);

// Поиск и получение пользователей
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);
router.get('/by-username/:username', userController.getUserByUsername);

// Обработчик ошибок multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Файл слишком большой. Максимум 5MB' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err.message && err.message.includes('Only images')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

export default router;