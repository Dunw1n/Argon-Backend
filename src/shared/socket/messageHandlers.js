// src/shared/socket/messageHandlers.js
import { Message, Chat, ChatParticipant } from '../../modules/index.js';
import { Op } from 'sequelize';
import { getUserSocketId } from './onlineUsers.js';

export const processUndeliveredMessages = async (userId, io) => {
  try {
    const chatParticipants = await ChatParticipant.findAll({
      where: { user_id: userId },
      attributes: ['chat_id'],
    });
    
    const chatIds = chatParticipants.map(cp => cp.chat_id);
    if (chatIds.length === 0) return;
    
    const undeliveredMessages = await Message.findAll({
      where: {
        chat_id: { [Op.in]: chatIds },
        delivered: false,
        sender_id: { [Op.ne]: userId }
      },
      attributes: ['id', 'sender_id'],
      limit: 100,
    });
    
    if (undeliveredMessages.length === 0) return;
    
    const messageIds = undeliveredMessages.map(m => m.id);
    await Message.update(
      { delivered: true, delivered_at: new Date() },
      { where: { id: { [Op.in]: messageIds } } }
    );
    
    // 🔥 Отправляем событие для каждого сообщения отдельно
    for (const message of undeliveredMessages) {
      const senderSocketId = getUserSocketId(message.sender_id);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message_delivered', { 
          messageId: message.id, 
          chatId: message.chat_id 
        });
      }
    }
  } catch (error) {
    console.error('Undelivered messages error:', error);
  }
};
export const markMessagesAsRead = async (chatId, userId, io) => {
  try {
    console.log(`📖 [SERVER] markMessagesAsRead called: chat ${chatId}, user ${userId}`);
    
    const messages = await Message.findAll({
      where: { 
        chat_id: chatId, 
        sender_id: { [Op.ne]: userId }, 
        read: false 
      },
      attributes: ['id', 'sender_id', 'chat_id']
    });
    
    console.log(`📊 [SERVER] Found ${messages.length} unread messages`);
    
    if (messages.length === 0) return 0;
    
    for (const message of messages) {
      await message.update({ read: true, read_at: new Date() });
      console.log(`✅ [SERVER] Message ${message.id} marked as read`);
      
      // 🔥 ОТПРАВЛЯЕМ СОБЫТИЕ ОТПРАВИТЕЛЮ
      const senderSocketId = getUserSocketId(message.sender_id);
      console.log(`📨 [SERVER] Sender socket for ${message.sender_id}: ${senderSocketId}`);
      
      if (senderSocketId) {
        io.to(senderSocketId).emit('message_read', { 
          messageId: message.id, 
          chatId 
        });
        console.log(`✅ [SERVER] message_read sent to ${message.sender_id}`);
      } else {
        console.log(`⚠️ [SERVER] No socket found for sender ${message.sender_id}`);
      }
    }
    
    return messages.length;
  } catch (error) {
    console.error('Mark read error:', error);
    return 0;
  }
};