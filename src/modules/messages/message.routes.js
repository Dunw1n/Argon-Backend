import { Router } from 'express';
import messageController from './message.controller.js';
import { authMiddleware } from '../../shared/middleware/index.js';

const router = Router({ mergeParams: true });

// Все роуты требуют аутентификации
router.use(authMiddleware);

// GET /api/chats/:chatId/messages - получить сообщения чата
router.get('/', messageController.getChatMessages);

// POST /api/chats/:chatId/messages - отправить сообщение
router.post('/', messageController.sendMessage);

// DELETE /api/chats/:chatId/messages/:messageId - удалить сообщение
router.delete('/:messageId', messageController.deleteMessage);

// POST /api/chats/:chatId/messages/delivered - отметить сообщения как доставленные
router.post('/delivered', messageController.markAsDelivered);

export default router;