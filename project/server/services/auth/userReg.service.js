const { hash } = require('bcrypt');
const validate = require("../../utils/validateAuthForm");
const emailService = require('../email.service');
const db = require('../../database/database');
const logger = require("../../utils/logger");

module.exports = {
    // Валидация данных пользователя
    async validateUserData(userData) {
        return validate('register', userData);
    },

    // Проверка уникальности username и email
    async checkUserUniqueness(username, email) {
        const existingUser = await db.repositories.User.findByCredentials(username, email);
        return {
            usernameExists: existingUser?.username === username,
            emailExists: existingUser?.email === email
        };
    },

    // Регистрация нового пользователя
    async registerUser(userData, ipAddress) {
        const transaction = await db.sequelize.transaction();

        try {
            const passwordHash = await hash(userData.password, 12);

            const user = await db.repositories.User.createUser({
                username: userData.username,
                email: userData.email,
                password_hash: passwordHash,
                is_active: false
            }, transaction);

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
                user,
                tempAuthToken: activationToken.temp_auth_token
            };

        } catch (error) {
            await transaction.rollback();
            logger.error(error, `USER_REG_SERVICE`);
            throw error;
        }
    },
};