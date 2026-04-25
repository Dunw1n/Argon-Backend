import chatService from './chat.service.js';
import messageService from '../messages/message.service.js';

class ChatController {
  async getUserChats(req, res) {
    try {
      const userId = req.user.id;
      
      const chats = await chatService.getUserChats(userId);
      
      res.json(chats);
    } catch (error) {
      console.error('Get chats error:', error);
      res.status(500).json({ error: 'Failed to get chats' });
    }
  }
  
  async createChat(req, res) {
    try {
      const { userEmail } = req.body;
      
      if (!userEmail) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      const chat = await chatService.createChat(req.user.id, userEmail);
      
      // Отправляем события через Socket.IO
      const io = req.app.get('io');
      if (io) {
        chat.participants.forEach(participant => {
          io.to(`user_${participant.id}`).emit('chat_created', chat);
        });
      }
      
      res.status(201).json(chat);
    } catch (error) {
      console.error('Create chat error:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Cannot create chat with yourself') {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async getChatById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const chat = await chatService.getChatById(id, userId);
      
      res.json(chat);
    } catch (error) {
      console.error('Get chat error:', error);
      
      if (error.message === 'Chat not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async markChatAsRead(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;
      
      const result = await messageService.markChatAsRead(chatId, userId);
      
      res.json({ success: true, updatedCount: result.updatedCount });
    } catch (error) {
      console.error('Mark chat as read error:', error);
      res.status(500).json({ error: 'Failed to mark chat as read' });
    }
  }
}

export default new ChatController();