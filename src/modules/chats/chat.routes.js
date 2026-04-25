import { Router } from 'express';
import chatController from './chat.controller.js';
import { authMiddleware } from '../../shared/middleware/index.js';

const router = Router();

// Все роуты требуют аутентификации
router.use(authMiddleware);

// GET /api/chats - получить все чаты пользователя
router.get('/', chatController.getUserChats);

// POST /api/chats - создать новый чат
router.post('/', chatController.createChat);

// GET /api/chats/:id - получить чат по ID
router.get('/:id', chatController.getChatById);

// POST /api/chats/:chatId/read - отметить сообщения как прочитанные
router.post('/:chatId/read', chatController.markChatAsRead);

export default router;