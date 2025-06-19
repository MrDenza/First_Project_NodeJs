const tokenService = require("../token.service");
const db = require('../../database/database');

module.exports = {
    // Валидация refresh токена
    async validateRefreshToken(refreshToken) {
        const payload = await tokenService.verifyTokenAsync(refreshToken);
        if (!payload || payload.type !== 'refresh') return null;

        // 2. Поиск активной сессии
        const tokenHash = tokenService.hashToken(refreshToken);
        return db.repositories.Session.findByTokenHash(tokenHash);
    },

    // Обновляет access токен при необходимости
    async refreshAccessToken(accessToken, clientInfo) {
        const transaction = await db.sequelize.transaction();

        try {
            // Проверка текущего токена
            const needRefresh = !await tokenService.verifyTokenAsync(accessToken) ||
                !await tokenService.isTokenFreshAsync(accessToken);

            if (!needRefresh) {
                await transaction.commit();
                return { accessToken, isNew: false };
            }

            // Отзыв старой сессии
            if (accessToken) {
                await db.repositories.Session.revokeByAccessToken(accessToken, transaction);
            }

            // Обновление сессии с генерацией access токена
            const { aToken } = await db.repositories.Session.updateAccessTokenAndInfo(
                clientInfo.session_id,
                {
                    user_id: clientInfo.user_id,
                    ip_address: clientInfo.ip_address,
                    device_info: clientInfo.device_info,
                }, transaction);

            await transaction.commit();
            return { accessToken: aToken, isNew: true };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};








    // // Проверка на наличие и валидность access токена
    // async validateAndRefreshAccToken(accessToken, clientInfo) {
    //     const activeSession = await sessionRepo.findActiveSession(accessToken);
    //     console.log(accessToken);
    //     console.log(activeSession);
    //     console.log(tokenService.isTokenValidAndNotExpiringSoon(accessToken));
    //     if (activeSession && tokenService.isTokenValidAndNotExpiringSoon(accessToken)) {
    //         return {
    //             token: accessToken,
    //             isNew: false,
    //             //session: activeSession
    //         };
    //     }
    //
    //     if (activeSession) await sessionRepo.revokeSession(activeSession.id);
    //
    //     const newToken = tokenService.generateAccessToken(clientInfo.user_id);
    //     const newSession = await sessionRepo.createSession({
    //         access_token: newToken,
    //         ...clientInfo
    //     });
    //
    //     return {
    //         token: newToken,
    //         isNew: true
    //         //session: newSession
    //     };
    // },
