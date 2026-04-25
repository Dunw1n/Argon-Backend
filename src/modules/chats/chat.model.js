import { DataTypes } from 'sequelize';
import sequelize from '../../shared/database/index.js';

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  tableName: 'chats',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  freezeTableName: true,
  
  indexes: [
    {
      fields: ['updated_at'],
      name: 'idx_chats_updated_at',
    },
    {
      fields: ['created_at'],
      name: 'idx_chats_created_at',
    },
  ],
});

export default Chat;