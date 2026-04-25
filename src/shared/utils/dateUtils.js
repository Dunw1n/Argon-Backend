// src/shared/utils/dateUtils.js

export const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return 'был(а) недавно';
  
  const now = new Date();
  const last = new Date(lastSeen);
  const diffMs = now - last;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays === 1) return 'вчера';
  return `${diffDays} дн. назад`;
};

export const isOnline = (lastSeen) => {
  if (!lastSeen) return false;
  const now = new Date();
  const last = new Date(lastSeen);
  const diffMs = now - last;
  // Считаем онлайн если последняя активность была менее 5 минут назад
  return diffMs < 5 * 60 * 1000;
};