import { Sequelize } from "sequelize";

// На Render будет process.env.DATABASE_URL
// На локальном компьютере используем старые настройки
const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction && process.env.DATABASE_URL) {
    // Для Render
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 10,
            min: parseInt(process.env.DB_POOL_MIN) || 0,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
            idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
        }
    });
} else {
    // Для локальной разработки (ваш текущий .env)
    sequelize = new Sequelize(
        process.env.DB_NAME || 'ArgonMessager',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || '1234',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: false,
            pool: {
                max: parseInt(process.env.DB_POOL_MAX) || 10,
                min: parseInt(process.env.DB_POOL_MIN) || 0,
                acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
                idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
            }
        }
    );
}

export default sequelize;