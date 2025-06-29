const db = require('../../database/database');
const logger = require("../../utils/logger");

module.exports = {
    // Проверка наличия токена активации
    async validateActivationToken(token) {
        return await db.repositories.UserActivationToken.findByActivationToken(token);
    },

    // Активация пользователя
    async activateUserAccount(userId, ipAddress) {
        const transaction = await db.sequelize.transaction();

        try {
            await db.repositories.User.activate(userId, transaction);

            await db.repositories.UserActivationToken.deleteAllForUser(userId, transaction);

            const { rToken } = await db.repositories.Session.create({ userId, ipAddress}, false, transaction);

            await transaction.commit();
            return { rToken };
        } catch (error) {
            await transaction.rollback();
            logger.error(error, `USER_ACTIVATION_SERVICE`);
            throw error;
        }
    }
};