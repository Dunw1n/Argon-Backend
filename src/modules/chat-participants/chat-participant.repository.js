import ChatParticipant from './chat-participant.model.js';

class ChatParticipantRepository {
  async addParticipants(chatId, userIds) {
    const participants = userIds.map(userId => ({
      chat_id: chatId,
      user_id: userId,
    }));
    
    return await ChatParticipant.bulkCreate(participants);
  }
  
  async getChatParticipants(chatId) {
    return await ChatParticipant.findAll({
      where: { chat_id: chatId },
      attributes: ['user_id'],
    });
  }
  
  async getUserChatIds(userId) {
    const participants = await ChatParticipant.findAll({
      where: { user_id: userId },
      attributes: ['chat_id'],
    });
    
    return participants.map(p => p.chat_id);
  }
  
  async isParticipant(chatId, userId) {
    const participant = await ChatParticipant.findOne({
      where: { chat_id: chatId, user_id: userId },
    });
    
    return !!participant;
  }
  
  async removeParticipant(chatId, userId) {
    return await ChatParticipant.destroy({
      where: { chat_id: chatId, user_id: userId },
    });
  }
}

export default new ChatParticipantRepository();