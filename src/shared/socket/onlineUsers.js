// src/shared/socket/onlineUsers.js
const onlineUsers = new Map();
const userLastActivity = new Map(); // Для отслеживания последней активности

export const getOnlineUsers = () => onlineUsers;
export const isUserOnline = (userId) => onlineUsers.has(userId);
export const getUserSocketId = (userId) => onlineUsers.get(userId);

export const addOnlineUser = (userId, socketId) => {
  onlineUsers.set(userId, socketId);
  userLastActivity.set(userId, new Date());
};

export const removeOnlineUser = (userId) => {
  onlineUsers.delete(userId);
  userLastActivity.delete(userId);
};

export const updateUserActivity = (userId) => {
  userLastActivity.set(userId, new Date());
};

export const getUserLastActivity = (userId) => {
  return userLastActivity.get(userId) || null;
};

export const getAllOnlineUserIds = () => Array.from(onlineUsers.keys());