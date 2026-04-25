// src/shared/socket/socket.handlers.js
import { Chat, ChatParticipant } from '../../modules/index.js';
import { 
  addOnlineUser, 
  removeOnlineUser, 
  getAllOnlineUserIds,
  getUserSocketId,
  updateUserActivity
} from './onlineUsers.js';
import { updateUserLastSeen, emitToChat } from './socket.utils.js';
import { processUndeliveredMessages, markMessagesAsRead } from './messageHandlers.js';
import messageService from '../../modules/messages/message.service.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    const userEmail = socket.user.email;
    
    console.log(`✅ Connected: ${userEmail} (${userId})`);
    
    await updateUserLastSeen(userId);
    
    socket.join(`user_${userId}`);
    addOnlineUser(userId, socket.id);
    
    socket.emit('online_users', getAllOnlineUserIds());
    
    io.emit('user_status', { 
      userId, 
      status: 'online', 
      last_seen: new Date() 
    });
    
    // Обрабатываем недоставленные сообщения
    await processUndeliveredMessages(userId, io);
    
    // ========== Heartbeat для поддержания статуса онлайн ==========
    socket.on('heartbeat', async () => {
      updateUserActivity(userId);
      await updateUserLastSeen(userId);
      
      // Отправляем подтверждение
      socket.emit('heartbeat_ack', { timestamp: new Date() });
    });
    
    // ========== Присоединение к чату ==========
    socket.on('join_chat', async (chatId) => {
      try {
        updateUserActivity(userId);
        await updateUserLastSeen(userId);
        
        const isParticipant = await ChatParticipant.findOne({
          where: { chat_id: chatId, user_id: userId }
        });
        
        if (isParticipant) {
          socket.join(chatId);
          emitToChat(io, chatId, 'user_joined', { userId, chatId });
          console.log(`📌 User ${userEmail} joined chat ${chatId}`);
        }
      } catch (error) {
        console.error('Join chat error:', error);
      }
    });
    
    // ========== Отправка сообщения ==========
  socket.on('send_message', async ({ chatId, text, tempId }) => {
  try {
    updateUserActivity(userId);
    await updateUserLastSeen(userId);
    
    const message = await messageService.sendMessage(chatId, userId, text, tempId);
    
    console.log(`📨 [SERVER] Message created: ${message.id}, chat: ${chatId}`);
    
    // Отправляем в комнату чата
    io.to(chatId).emit('new_message', message);
    
    // Подтверждение отправителю
    socket.emit('message_sent', { tempId, message });
    console.log(`📤 [SERVER] message_sent sent to sender ${userId}`);
    
    // 🔥 ПОЛУЧАЕМ ПОЛУЧАТЕЛЯ
    const chat = await Chat.findByPk(chatId, {
      include: [{ association: 'participants', attributes: ['id'] }]
    });
    
    const recipient = chat?.participants?.find(p => p.id !== userId);
    console.log(`👥 [SERVER] Recipient: ${recipient?.id}`);
    
    const recipientSocketId = recipient ? getUserSocketId(recipient.id) : null;
    console.log(`🔌 [SERVER] Recipient socket: ${recipientSocketId}`);
    
    // 🔥 ВСЕГДА ОТМЕЧАЕМ КАК ДОСТАВЛЕННОЕ (если получатель онлайн)
    if (recipientSocketId) {
      await messageService.markMessagesAsDelivered([message.id]);
      console.log(`✅ [SERVER] Message ${message.id} marked as delivered`);
      
      // Отправляем событие отправителю
      io.to(getUserSocketId(userId)).emit('message_delivered', { 
        messageId: message.id, 
        chatId 
      });
      console.log(`📨 [SERVER] message_delivered sent to sender ${userId}`);
    } else {
      console.log(`⚠️ [SERVER] Recipient ${recipient?.id} is offline, message not marked as delivered`);
    }
  } catch (error) {
    console.error('Send message error:', error);
    socket.emit('message_error', { error: error.message });
  }
});
    
    // ========== Отметка о прочтении ==========
   socket.on('mark_chat_read', async (chatId) => {
  console.log(`📖 [SERVER] mark_chat_read received from user ${userId} for chat ${chatId}`);
  
  updateUserActivity(userId);
  await updateUserLastSeen(userId);
  
  const count = await markMessagesAsRead(chatId, userId, io);
  console.log(`📊 [SERVER] Marked ${count} messages as read`);
  
  if (count > 0) {
    socket.emit('chat_marked_read', { chatId, count });
  }
});
    
    // ========== Статус печатания ==========
    socket.on('typing', ({ chatId, isTyping }) => {
      updateUserActivity(userId);
      socket.to(chatId).emit('user_typing', { 
        userId, 
        userName: socket.user.name, 
        chatId, 
        isTyping 
      });
    });
    
    // ========== Получение онлайн пользователей ==========
    socket.on('get_online_users', () => {
      socket.emit('online_users', getAllOnlineUserIds());
    });
    
    // ========== Получение статуса пользователя ==========
    socket.on('get_user_status', async (targetUserId) => {
      const isOnline = getUserSocketId(targetUserId) !== undefined;
      socket.emit('user_status', { 
        userId: targetUserId, 
        status: isOnline ? 'online' : 'offline',
        last_seen: new Date()
      });
    });
    
    // ========== Покидание чата ==========
    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
      io.to(chatId).emit('user_left', { userId, chatId });
    });
    
    // ========== Отключение ==========
    socket.on('disconnect', async () => {
      console.log(`❌ Disconnected: ${userEmail} (${userId})`);
      removeOnlineUser(userId);
      await updateUserLastSeen(userId);
      
      // Оповещаем всех о том, что пользователь офлайн
      io.emit('user_status', { 
        userId, 
        status: 'offline', 
        last_seen: new Date() 
      });
    });
  });
};