// src/shared/socket/socket.utils.js

import { User } from '../../modules/index.js';
import { getUserSocketId } from './onlineUsers.js';

export const updateUserLastSeen = async (userId) => {
  try {
    await User.update(
      { last_seen: new Date() },
      { where: { id: userId } }
    );
  } catch (error) {
    console.error('Update last seen error:', error);
  }
};

export const emitToUser = (io, userId, event, data) => {
  const socketId = getUserSocketId(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

export const emitToChat = (io, chatId, event, data) => {
  io.to(chatId).emit(event, data);
};

export const broadcastUserStatus = (io, userId, status, lastSeen = new Date()) => {
  io.emit('user_status', { userId, status, last_seen: lastSeen });
};