import messageRepository from './message.repository.js';
import chatRepository from '../chats/chat.repository.js';
import chatParticipantRepository from '../chat-participants/chat-participant.repository.js';
import chatService from '../chats/chat.service.js';

class MessageService {
    async sendMessage(chatId, senderId, text, tempId = null) {
    const isParticipant = await chatParticipantRepository.isParticipant(chatId, senderId);
    if (!isParticipant) {
        throw new Error('Access denied');
    }
    
    const message = await messageRepository.create({
        text,
        chat_id: chatId,
        sender_id: senderId,
    });
    
    await chatService.updateChatTimestamp(chatId);
    const messageWithSender = await messageRepository.findById(message.id);
    
    // Форматируем для клиента
    const messageData = {
        id: messageWithSender.id,
        text: messageWithSender.text,
        sender_id: messageWithSender.sender_id,
        chat_id: messageWithSender.chat_id,
        created_at: messageWithSender.created_at,
        read: false,
        delivered: false,
        sender: messageWithSender.sender,
        tempId,
        status: 'sent'
    };
    
    return messageData;
    }
  
    async getChatMessages(chatId, userId, limit = 50, beforeId = null) {
        // Проверяем доступ
        const isParticipant = await chatParticipantRepository.isParticipant(chatId, userId);
        if (!isParticipant) {
        throw new Error('Access denied');
        }
        
        const messages = await messageRepository.getChatMessages(chatId, limit, beforeId);
        
        // Отмечаем сообщения как доставленные (только для получателя)
        const messageIds = messages
        .filter(m => m.sender_id !== userId && !m.delivered)
        .map(m => m.id);
        
        if (messageIds.length > 0) {
        await messageRepository.markAsDelivered(messageIds);
        }
        
        return messages.reverse();
    }
    
    async markChatAsRead(chatId, userId) {
        const updatedCount = await messageRepository.markAsRead(chatId, userId);
        
        // Получаем обновленные сообщения для отправки через сокет
        const updatedMessages = await messageRepository.getUnreadByChat(chatId, userId);
        
        return { updatedCount, updatedMessages };
    }
    
    async markMessagesAsDelivered(messageIds) {
        const updatedCount = await messageRepository.markAsDelivered(messageIds);
        
        // Получаем обновленные сообщения
        const messages = await messageRepository.findByIds(messageIds);
        
        return { updatedCount, messages };
    }
    
    async getUnreadMessages(userId) {
        return await messageRepository.getUnreadMessages(userId);
    }
    
    async deleteMessage(messageId, userId) {
        return await messageRepository.deleteMessage(messageId, userId);
    }
}

export default new MessageService();