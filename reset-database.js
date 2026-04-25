// scripts/resetDatabase.js
import sequelize from './src/shared/database/index.js';
import { User, Chat, Message, ChatParticipant } from './src/modules/index.js';

async function resetDatabase() {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Cannot reset database in production!');
      process.exit(1);
    }
    
    console.log('🔄 Resetting database...');
    
    // Удаляем таблицы в правильном порядке
    await sequelize.query('DROP TABLE IF EXISTS messages');
    await sequelize.query('DROP TABLE IF EXISTS chat_participants');
    await sequelize.query('DROP TABLE IF EXISTS chats');
    await sequelize.query('DROP TABLE IF EXISTS users');
    
    // Создаем таблицы заново
    await sequelize.sync();
    
    console.log('✅ Database reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();