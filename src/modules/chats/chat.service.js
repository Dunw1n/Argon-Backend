import userRepository from '../users/user.repository.js';
import chatRepository from './chat.repository.js';
import chatParticipantRepository from '../chat-participants/chat-participant.repository.js';
import messageRepository from '../messages/message.repository.js';

class ChatService {
 async getUserChats(userId) {
  const chats = await chatRepository.getUserChats(userId);
  
  // Подсчет непрочитанных сообщений и добавление lastMessage
  const chatsWithData = await Promise.all(
    chats.map(async (chat) => {
      const unreadCount = await messageRepository.countUnread(chat.id, userId);
      
      return {
        ...chat,
        unreadCount,
        lastMessage: chat.lastMessage || null
      };
    })
  );
  
  // Сортировка по последнему сообщению
  return chatsWithData.sort((a, b) => {
    const dateA = a.lastMessage?.created_at || a.updated_at || new Date(0);
    const dateB = b.lastMessage?.created_at || b.updated_at || new Date(0);
    return new Date(dateB) - new Date(dateA);
  });
}
  
  async getChatById(chatId, userId) {
    const chat = await chatRepository.findById(chatId);
    
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    const isParticipant = chat.participants.some(p => p.id === userId);
    if (!isParticipant) {
      throw new Error('Access denied');
    }
    
    return chat;
  }
  
  async createChat(userId, userEmail) {
    // Находим пользователя по email
    const otherUser = await userRepository.findByEmail(userEmail);
    if (!otherUser) {
      throw new Error('User not found');
    }
    
    if (otherUser.id === userId) {
      throw new Error('Cannot create chat with yourself');
    }
    
    // Проверяем существующий чат
    const existingChat = await chatRepository.findByParticipantIds(userId, otherUser.id);
    if (existingChat) {
      return existingChat;
    }
    
    // Создаем новый чат
    const chat = await chatRepository.create();
    
    // Добавляем участников
    await chatParticipantRepository.addParticipants(chat.id, [userId, otherUser.id]);
    
    // Возвращаем чат с участниками
    return await chatRepository.findById(chat.id);
  }
  
  async updateChatTimestamp(chatId) {
    return await chatRepository.updateTimestamp(chatId);
  }
}

export default new ChatService();