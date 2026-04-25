import messageService from './message.service.js';
import chatService from '../chats/chat.service.js';

class MessageController {
  async getChatMessages(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;
      const { limit = 50, beforeId } = req.query;
      
      // Проверяем доступ к чату
      await chatService.getChatById(chatId, userId);
      
      // Получаем сообщения
      const messages = await messageService.getChatMessages(
        chatId, 
        userId, 
        parseInt(limit), 
        beforeId
      );
      
      // Форматируем сообщения для клиента
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        sender_id: msg.sender_id,
        chat_id: msg.chat_id,
        created_at: msg.created_at,
        read: msg.read,
        read_at: msg.read_at,
        delivered: msg.delivered,
        delivered_at: msg.delivered_at,
        sender: msg.sender,
        status: msg.read ? 'read' : (msg.delivered ? 'delivered' : 'sent')
      }));
      
      res.json(formattedMessages);
    } catch (error) {
      console.error('Get messages error:', error);
      
      if (error.message === 'Chat not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to get messages' });
    }
  }
  
 async sendMessage(req, res) {
  try {
    const { chatId } = req.params;
    const { text, tempId } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }
    
    const message = await messageService.sendMessage(chatId, req.user.id, text.trim(), tempId);
    
    const io = req.app.get('io');
    if (io) {
      // Отправляем получателю
      const chat = await chatService.getChatById(chatId, req.user.id);
      const recipient = chat.participants.find(p => p.id !== req.user.id);
      
      if (recipient) {
        io.to(`user_${recipient.id}`).emit('new_message', message);
      }
      
      // Подтверждаем отправителю с полным статусом
      io.to(`user_${req.user.id}`).emit('message_sent', { 
        tempId, 
        message: {
          ...message,
          delivered: false,
          read: false,
          status: 'sent'
        }
      });
    }
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to send message' });
  }
}
  
  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;
      
      const deleted = await messageService.deleteMessage(messageId, userId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Message not found or unauthorized' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  }
  
  async markAsDelivered(req, res) {
    try {
      const { messageIds } = req.body;
      
      if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ error: 'Message IDs are required' });
      }
      
      const updatedCount = await messageService.markMessagesAsDelivered(messageIds);
      
      res.json({ success: true, updatedCount });
    } catch (error) {
      console.error('Mark as delivered error:', error);
      res.status(500).json({ error: 'Failed to mark messages as delivered' });
    }
  }
}

export default new MessageController();