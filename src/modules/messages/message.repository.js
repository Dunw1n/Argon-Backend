import { Op } from 'sequelize';
import Message from './message.model.js';
import { User } from '../users/user.model.js';

class MessageRepository {
  async create(messageData) {
    return await Message.create(messageData);
  }
  
  async findById(id) {
    return await Message.findByPk(id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
      ],
    });
  }
  
  async getChatMessages(chatId, limit = 50, beforeId = null) {
    const where = { chat_id: chatId };
    
    if (beforeId) {
      where.id = { [Op.lt]: beforeId };
    }
    
    return await Message.findAll({
      where,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
    });
  }
  
  async markAsRead(chatId, userId) {
    const [updatedCount] = await Message.update(
      { 
        read: true, 
        read_at: new Date() 
      },
      {
        where: {
          chat_id: chatId,
          sender_id: { [Op.ne]: userId },
          read: false,
        },
      }
    );
    
    return updatedCount;
  }
  
  async markAsDelivered(messageIds) {
    const [updatedCount] = await Message.update(
      { 
        delivered: true, 
        delivered_at: new Date() 
      },
      {
        where: {
          id: { [Op.in]: messageIds },
          delivered: false,
        },
      }
    );
    
    return updatedCount;
  }
  
  async countUnread(chatId, userId) {
    return await Message.count({
      where: {
        chat_id: chatId,
        sender_id: { [Op.ne]: userId },
        read: false,
      },
    });
  }

  async getUnreadByChat(chatId, userId) {
    return await Message.findAll({
        where: {
        chat_id: chatId,
        sender_id: { [Op.ne]: userId },
        read: false
        },
        attributes: ['id', 'read']
    });
  }
  
  async getUnreadMessages(userId) {
    return await Message.findAll({
      where: {
        sender_id: { [Op.ne]: userId },
        read: false,
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
      ],
      order: [['created_at', 'ASC']],
    });
  }

  async findByIds(ids) {
    return await Message.findAll({
        where: { id: { [Op.in]: ids } },
        attributes: ['id', 'read', 'delivered']
    });
  }
  
  async deleteMessage(messageId, userId) {
    const message = await this.findById(messageId);
    
    if (!message || message.sender_id !== userId) {
      return false;
    }
    
    await message.destroy();
    return true;
  }

    async countUnread(chatId, userId) {
        const { Op } = await import('sequelize');
        return await Message.count({
            where: {
            chat_id: chatId,
            sender_id: { [Op.ne]: userId },
            read: false,
            },
        });
    }
}

export default new MessageRepository();