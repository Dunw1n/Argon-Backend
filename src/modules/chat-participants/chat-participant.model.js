import { DataTypes } from 'sequelize';
import sequelize from '../../shared/database/index.js';

const ChatParticipant = sequelize.define('ChatParticipant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  chat_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'chats',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'chat_participants',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  
  indexes: [
    {
      fields: ['chat_id', 'user_id'],
      unique: true,
      name: 'idx_chat_participants_unique',
    },
    {
      fields: ['user_id'],
      name: 'idx_chat_participants_user_id',
    },
    {
      fields: ['chat_id'],
      name: 'idx_chat_participants_chat_id',
    },
  ],
});

export default ChatParticipant;
export { ChatParticipant }