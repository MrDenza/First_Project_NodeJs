const { Op } = require('sequelize');
const tokenService = require('../../services/token.service');

module.exports = (models) => ({
    // Создать новую сессию (30 дней по умолчанию) (опционально генерация access)
    async create({userId, ipAddress, deviceInfo = null, username}, generateAToken = false, transaction = null) {
        const rToken = await tokenService.generateRefreshTokenAsync();
        const aToken = generateAToken ? await tokenService.generateAccessTokenAsync({userId, username}) : '';
        const session = await models.Session.create({
            user_id: userId,
            token_hash: tokenService.hashToken(rToken),
            access_token: aToken,
            ip_address: ipAddress,
            device_info: deviceInfo,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
        }, { transaction });

        return { rToken, aToken, session };
    },

    // Найти сессию по access токену
    // async findByAccessToken(accessToken) {
    //     return models.Session.findOne({
    //         where: {
    //             access_token: accessToken,
    //             is_revoked: false,
    //             expires_at: { [Op.gt]: new Date() }
    //         }
    //     });
    // },

    // Найти активную сессию по хешу refresh токена
    async findByTokenHash(refreshToken) {
        const tokenHash = tokenService.hashToken(refreshToken);
        return models.Session.findOne({
            where: {
                token_hash: tokenHash,
                is_revoked: false,
                expires_at: { [Op.gt]: new Date() }
            },
            include: {
                association: 'user',
                attributes: ['id', 'username', 'email']
            }
        });
    },

    // Обновить access токен в сессии + информацию
    async updateAccessTokenAndInfo(sessionId, { ip_address, device_info, user_id, username }, transaction = null) {
        const aToken = await tokenService.generateAccessTokenAsync({user_id, username});
        const [affectedCount] = await models.Session.update(
            {
                access_token: aToken,
                ip_address,
                device_info,
            },
            {
                where: { id: sessionId },
                transaction
            }
        );
        return { aToken };
    },

    // Отозвать все сессии пользователя
    // async revokeAllForUser(userId, transaction = null) {
    //     const [affectedCount] = await models.Session.update(
    //         { is_revoked: true },
    //         {
    //             where: {
    //                 user_id: userId,
    //                 is_revoked: false
    //             },
    //             transaction
    //         }
    //     );
    //     return affectedCount;
    // },

    // Отозвать конкретную сессию по ID
    // async revoke(sessionId, transaction = null) {
    //     const [affectedCount] = await models.Session.update(
    //         { is_revoked: true },
    //         {
    //             where: { id: sessionId },
    //             transaction
    //         }
    //     );
    //     return affectedCount > 0;
    // },

    // Отозвать сессию по access-токену
    async revokeByAccessToken(accessToken, transaction = null) {
        const [affectedCount] = await models.Session.update(
            { is_revoked: true },
            {
                where: { access_token: accessToken },
                transaction
            }
        );
        return affectedCount;
    },

    // Удалить сессию по refresh токену
    async deleteByRefreshToken(refreshToken, transaction = null) {
        if (!refreshToken) return false;

        const tokenHash = tokenService.hashToken(refreshToken);

        const result = await models.Session.destroy({
            where: {
                token_hash: tokenHash
            },
            transaction
        });
        return result > 0;
    },

    // Получить все сессии пользователя (с фильтрацией по активности)
    // async getUserSessions(userId, onlyActive = true) {
    //     return models.Session.findAll({
    //         where: {
    //             user_id: userId,
    //             ...(onlyActive && {
    //                 is_revoked: false,
    //                 expires_at: { [Op.gt]: new Date() }
    //             })
    //         },
    //         order: [['created_at', 'DESC']],
    //         attributes: ['id', 'device_id', 'ip_address', 'created_at', 'expires_at']
    //     });
    // },

    // Очистка просроченных сессий
    // async cleanupExpired() {
    //     return models.Session.destroy({
    //         where: {
    //             expires_at: { [Op.lt]: new Date() }
    //         }
    //     });
    // }
});