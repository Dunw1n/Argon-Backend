import sequelize from '../shared/database/index.js';

// Импорт моделей
import User from './users/user.model.js';
import Chat from './chats/chat.model.js';
import Message from './messages/message.model.js';
import ChatParticipant from './chat-participants/chat-participant.model.js';

// ========== Установка связей ==========

// User ↔ Chat (многие ко многим через ChatParticipant)
User.belongsToMany(Chat, {
  through: ChatParticipant,
  foreignKey: 'user_id',
  otherKey: 'chat_id',
  as: 'chats',
  onDelete: 'CASCADE',
});

Chat.belongsToMany(User, {
  through: ChatParticipant,
  foreignKey: 'chat_id',
  otherKey: 'user_id',
  as: 'participants',
  onDelete: 'CASCADE',
});

// Chat ↔ Message (один ко многим)
Chat.hasMany(Message, {
  foreignKey: 'chat_id',
  as: 'messages',
  onDelete: 'CASCADE',
  hooks: true,
});

Message.belongsTo(Chat, {
  foreignKey: 'chat_id',
  as: 'chat',
});

// User ↔ Message (один ко многим)
User.hasMany(Message, {
  foreignKey: 'sender_id',
  as: 'messages',
  onDelete: 'CASCADE',
  hooks: true,
});

Message.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender',
});

// ========== Экспорт ==========
export { sequelize, User, Chat, Message, ChatParticipant };

// ========== Проверка связей (только для разработки) ==========
if (process.env.NODE_ENV !== 'production') {
  const checkAssociations = () => {
    console.log('\n📊 Model Associations:');
    console.log('  User ->', Object.keys(User.associations).join(', '));
    console.log('  Chat ->', Object.keys(Chat.associations).join(', '));
    console.log('  Message ->', Object.keys(Message.associations).join(', '));
    console.log('  ChatParticipant ->', Object.keys(ChatParticipant.associations).join(', '));
    console.log('');
  };
  
  setTimeout(checkAssociations, 500);
}