const db = require('../../database/database');
const tokenService = require("../token.service");
const logger = require("../../utils/logger");

module.exports = {
    // Проверяем подпись refresh токена
    async validRefreshToken(refreshToken) {
        const payload = await tokenService.verifyTokenAsync(refreshToken);
        return !(!payload || payload.type !== 'refresh');
    },

    // Разлогиниваем пользователя
    async logoutUser(refreshToken, accessToken) {
        try {
            // Удаляем сессию по refresh токену
            const revoked = await db.repositories.Session.deleteByRefreshToken(refreshToken);
            if (revoked) return true;

            // Если ошибка или refresh токен отсутствует, отзываем по access
            logger.error(`USER_LOGOUT_SERVICE | Выход пользователя. Не найден refresh токен: ${refreshToken}`);
            const session = await db.repositories.Session.revokeByAccessToken(accessToken);
            return !(!session && !revoked);
        } catch (error) {
            logger.error(error, `USER_LOGOUT_SERVICE | Ошибка удаления сессии пользователя`);
            return false;
        }
    },
}
