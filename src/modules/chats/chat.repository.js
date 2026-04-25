import { Op, Sequelize } from 'sequelize'; 
import Chat from './chat.model.js';
import { ChatParticipant } from '../chat-participants/chat-participant.model.js';
import { User } from '../users/user.model.js';
import { Message } from '../messages/message.model.js';

class ChatRepository {
  async findById(id) {
    return await Chat.findByPk(id, {
      include: [
        {
          model: User,
          as: 'participants',
          through: { attributes: [] },
          attributes: ['id', 'name', 'email', 'avatar', 'username', 'last_seen'],
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']],
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'name', 'email', 'avatar'],
            },
          ],
        },
      ],
    });
  }
  
  async findByParticipantIds(userId1, userId2) {
    // Используем ChatParticipant напрямую, без sequelize.literal
    const participants = await ChatParticipant.findAll({
      where: { 
        user_id: [userId1, userId2] 
      },
      attributes: ['chat_id'],
      group: ['chat_id'],
      having: Sequelize.literal(`COUNT(DISTINCT user_id) = 2`)  // 👈 Теперь Sequelize определен
    });
    
    if (participants.length === 0) return null;
    
    return await this.findById(participants[0].chat_id);
  }
  
 async getUserChats(userId) {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Chat,
        as: 'chats',
        include: [
          {
            model: User,
            as: 'participants',
            through: { attributes: [] },
            attributes: ['id', 'name', 'email', 'avatar', 'last_seen'],
          },
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['created_at', 'DESC']],
            include: [{
              model: User,
              as: 'sender',
              attributes: ['id', 'name', 'email', 'avatar'],
            }],
          },
        ],
        order: [['updated_at', 'DESC']],
      },
    ],
  });
  
  const chats = user?.chats || [];
  
  return chats.map(chat => {
    const chatObj = chat.toJSON();
    chatObj.lastMessage = chat.messages?.[0] || null;
    
    // Добавляем статус онлайн для каждого участника
    if (chatObj.participants) {
      chatObj.participants = chatObj.participants.map(participant => {
        const lastSeen = new Date(participant.last_seen);
        const now = new Date();
        const diffMs = now - lastSeen;
        participant.isOnline = diffMs < 2 * 60 * 1000;
        return participant;
      });
    }
    
    return chatObj;
  });
}
  
  async create() {
    return await Chat.create();
  }
  
  async updateTimestamp(chatId) {
    return await Chat.update(
      { updated_at: new Date() },
      { where: { id: chatId } }
    );
  }
}

export default new ChatRepository();