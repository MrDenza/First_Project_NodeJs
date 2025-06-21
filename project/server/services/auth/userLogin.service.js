const validate = require("../../utils/validateAuthForm");
const { compare } = require("bcrypt");
const db = require('../../database/database');
const emailService = require("../email.service");

module.exports = {
    // Валидация данных пользователя
    async validateUserData(credentials) {
        return validate("login", credentials);
    },

    // Проверка существования пользователя
    async findUserByLogin(login) {
        return db.repositories.User.findByCredentials(login, login);
    },

    // Проверка пароля
    async verifyPassword(inputPassword, storedHash) {
        return compare(inputPassword, storedHash);
    },

    // Генерация временного токена активации
    async generateTempAuthToken(user, ipAddress) {
        const transaction = await db.sequelize.transaction();
        try {
            await db.repositories.UserActivationToken.deleteAllForUser(user.id, transaction);

            const activationToken = await db.repositories.UserActivationToken.createActToken({
                user_id: user.id,
                ip_address: ipAddress
            }, transaction);

            await transaction.commit();

            await emailService.sendActivationLink({
                email: user.email,
                username: user.username,
                token: activationToken.activation_token
            });

            return {
                tempAuthToken: activationToken.temp_auth_token
            };
        } catch (error) {
            await transaction.rollback();
            console.error('Ошибка авторизации - токен активации: ', error);
            throw error;
        }
    },

    // Создание сессии пользователя
    async createUserSession(user, clientInfo) {
        const { rToken, aToken } = await db.repositories.Session.create({
            userId: user.id,
            username: user.username,
            ipAddress: clientInfo.ip_address,
            deviceInfo: clientInfo.device_info
        }, true);
        return { accessToken: aToken, refreshToken: rToken };
    }
};