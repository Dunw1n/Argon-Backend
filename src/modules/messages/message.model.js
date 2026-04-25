import { DataTypes } from 'sequelize';
import sequelize from '../../shared/database/index.js';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
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
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  read: { 
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  read_at: {  
    type: DataTypes.DATE,
    allowNull: true,
  },
  delivered: { 
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  delivered_at: { 
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'messages',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  freezeTableName: true,
  
  indexes: [
    {
      fields: ['chat_id'],
      name: 'idx_messages_chat_id',
    },
    {
      fields: ['created_at'],
      name: 'idx_messages_created_at',
    },
    {
      fields: ['chat_id', 'created_at'],
      name: 'idx_messages_chat_created',
    },
    {
      fields: ['chat_id', 'read'],
      name: 'idx_messages_chat_read',
      where: { read: false },
    },
    {
      fields: ['sender_id', 'read'],
      name: 'idx_messages_sender_read',
    },
    {
      fields: ['delivered'],
      name: 'idx_messages_delivered',
      where: { delivered: false },
    },
  ],
});

export default Message;
export { Message }