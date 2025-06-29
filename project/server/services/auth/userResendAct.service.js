const emailService = require("../email.service");
const db = require('../../database/database');

module.exports = {
    // Проверка временного токена
    async validateTempToken(tempToken) {
        return db.repositories.UserActivationToken.findByTempToken(tempToken);
    },

    // Получение пользователя для активации
    async getUserForActivation(userId) {
        const user = await db.repositories.User.findById(userId);
        if (!user) {
            throw new Error('Пользователь не найден.')
        };
        return user;
    },

    // Повторная отправка письма активации
    async resendActivationEmail(user, tokenId) {

        const { activation_token, expires_at } = await db.repositories.UserActivationToken.updateActToken(tokenId);

        if (!activation_token) {
            throw new Error('Ошибка обновления токена.');
        }

        await emailService.sendActivationLink({
            email: user.email,
            username: user.username,
            token: activation_token
        });

        return {
            email: user.email,
            expiresAt: expires_at
        };
    }
};