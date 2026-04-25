import { sequelize, User, Chat, Message, ChatParticipant } from '../../modules/index.js';

const initDatabase = async () => {
  try {
    // Проверяем подключение
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Определяем окружение
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Синхронизация таблиц
    if (isDevelopment) {
      // Для локальной разработки: обновляем структуру без потери данных
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized (development mode)');
    } else if (isProduction) {
      // Для production: проверяем, но не изменяем структуру автоматически
      // Лучше использовать миграции, но если их нет - просто проверяем
      console.log('🚀 Production mode - checking tables exist');
      await sequelize.sync({ alter: false });
      console.log('✅ Database tables verified');
    }
    
    // Логируем загруженные модели
    const models = {
      User: !!User,
      Chat: !!Chat,
      Message: !!Message,
      ChatParticipant: !!ChatParticipant,
    };
    
    console.log('📦 Models loaded:', models);
    
    // Проверяем, что все модели загружены
    const missingModels = Object.entries(models)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name);
    
    if (missingModels.length > 0) {
      console.warn(`⚠️ Missing models: ${missingModels.join(', ')}`);
    } else {
      console.log('✅ All models loaded successfully');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    
    // Детальная диагностика для production
    if (process.env.NODE_ENV === 'production') {
      console.error('\n🔧 Troubleshooting tips:');
      console.error('1. Check DATABASE_URL environment variable in Render');
      console.error('2. Verify SSL settings in sequelize configuration');
      console.error('3. Ensure database exists and credentials are correct');
      console.error('4. Check if Render PostgreSQL is fully provisioned');
    }
    
    throw error;
  }
};

export default initDatabase;