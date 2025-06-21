const db = require('../../database/database');
const tokenService = require("../token.service");

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
            console.error('Выход пользователя. Не найден refresh токен: ', refreshToken);
            const session = await db.repositories.Session.revokeByAccessToken(accessToken);
            return !(!session && !revoked);
        } catch (error) {
            console.error('Ошибка удаления сессии пользователя:', error);
            return false;
        }
    },
}
