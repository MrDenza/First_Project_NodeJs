const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');
const { MYSQL } = require("../config/mysql.config");
const logModelAssociations = require("./logModelAssociations");
const logger = require("../utils/logger");

const sequelize = new Sequelize(
    MYSQL.database,
    MYSQL.user,
    MYSQL.password,
    {
        host: MYSQL.host,
        dialect: 'mysql',
        dialectModule: mysql2,
        logging: false,
        define: {
            underscored: true, // Автоматически преобразует camelCase в snake_case
            paranoid: false // Для мягкого удаления (опционально)
        },
        pool: {
            max: MYSQL.pool.max, // Максимум подключений
            min: MYSQL.pool.min, // Минимум подключений в режиме ожидания
            acquire: MYSQL.pool.acquireTimeout, // Время ожидания нового подключения (мс)
            idle: MYSQL.pool.idleTimeout, // Время неактивного подключения перед закрытием (мс)
            evict: MYSQL.pool.reapIntervalMillis, // Проверять "мертвые" подключения каждые 10 сек
        },
        retry: { // Стратегия повторных попыток
            max: 3, // Максимум 3 попытки
            match: [ // Список ошибок
                /ETIMEDOUT/,
                /EHOSTUNREACH/,
                /ECONNRESET/,
                /ECONNREFUSED/,
                /ETIMEDOUT/,
                /ESOCKETTIMEDOUT/,
                /EHOSTUNREACH/,
                /EPIPE/,
                /EAI_AGAIN/,
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/
            ]
        }
    }
);

const { models, repositories } = require('./models')(sequelize);

logModelAssociations(models, { detailed: true, colors: true });

sequelize.addHook('afterConnect', () => {
    logger.info(`Установлено новое соединение с БД`);
});
sequelize.addHook('beforeDisconnect', () => {
    logger.info(`Соединение с БД будет закрыто`);
});

async function authenticate() {
    try {
        await sequelize.authenticate();
        //await sequelize.sync({ alter: true }); // Синхронизация моделей и структуры таблиц БД
        logger.info(`Подключение к БД успешно!`);
    } catch (error) {
        logger.error(error, `Ошибка подключения к БД`);
        throw error;
    }
}

module.exports = {
    sequelize,
    authenticate,
    models,
    repositories
};