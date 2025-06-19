const { Op } = require('sequelize');
const crypto = require("crypto");

module.exports = (models) => ({
    // Создать новый токен (автоматическая генерация значений)
    async createActToken(tokenData, transaction = null) {
        return models.UserActivationToken.create(tokenData, { transaction });
    },

    // Найти по токену активации
    async findByActivationToken(token) {
        return models.UserActivationToken.findOne({
            where: { activation_token: token },
            include: {
                association: 'user',
            }
        });
    },

    // Найти токен по временному токену
    async findByTempToken(tempToken) {
        return models.UserActivationToken.findOne({
            where: {
                temp_auth_token: tempToken,
                expires_at: { [Op.gt]: new Date() }
            },
            include: {
                association: 'user',
            }
        });
    },

    // Обновить токен активации
    async updateActToken(tokenId, transaction = null) {
        const newToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 час

        const [affectedCount] = await models.UserActivationToken.update({
            activation_token: newToken,
            expires_at: expiresAt
        },
            { where: { id: tokenId }, transaction }
        );

        if (affectedCount > 0) {
            return models.UserActivationToken.findByPk(tokenId, { transaction });
        }
        return null;
    },

    // Удалить все токены пользователя
    async deleteAllForUser(userId, transaction = null) {
        return models.UserActivationToken.destroy({
            where: { user_id: userId },
            transaction
        });
    },

    // Удалить конкретный токен
    // async deleteToken(tokenId) {
    //     return models.UserActivationToken.destroy({
    //         where: { id: tokenId }
    //     });
    // },

    // Очистить просроченные токены
    // async cleanupExpired() {
    //     return models.UserActivationToken.destroy({
    //         where: {
    //             expires_at: { [Op.lt]: new Date() }
    //         }
    //     });
    // }
});