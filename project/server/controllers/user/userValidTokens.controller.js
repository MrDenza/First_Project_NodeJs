const tokenValidService = require('../../services/auth/userValidTokens.service');
const favoritesService = require("../../services/favorites/userFavorites.service");
const logger = require("../../utils/logger");

module.exports = async function handleUserValidTokens (req, res) {

    try {
        const refreshToken = req.cookies.refreshToken || null;
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null;

        // Проверка входных данных
        if (!refreshToken) {
            res.clearCookie('refreshToken');
            return res.status(401).json({
                success: false,
                code: 'TOKENS_MISSING',
                status: 401,
                message: 'Требуется авторизация.',
                data: {
                    isValid: false,
                }
            });
        }

        // Валидируем refresh токен
        const session = await tokenValidService.validateRefreshToken(refreshToken);
        if (!session) {
            res.clearCookie('refreshToken');
            return res.status(401).json({
                success: false,
                code: 'INVALID_REFRESH_TOKEN',
                status: 401,
                message: 'Сессия истекла. Авторизуйтесь снова.',
                data: {
                    isValid: false,
                }
            });
        }

        // Валидируем и создаём новый access токен
        const clientInfo = {
            user_id: session.user_id,
            username: session.user.username,
            session_id: session.id,
            ip_address: req.ip,
            //device_info: req.device.type || 'Информация отсутствует'
        };

        const { accessToken: newAccessToken, isNew } = await tokenValidService.refreshAccessToken(
            accessToken,
            clientInfo
        );

        const userPosts = await favoritesService.getUserPosts(session.user_id);

        return res.status(200).json({
            success: true,
            code: 'SESSION_VALID',
            status: 200,
            message: isNew ? 'Сессия обновлена' : 'Сессия активна',
            data: {
                username: session.toJSON().user.username,
                isValid: true,
                accessToken: newAccessToken,
                isNewToken: isNew,
                isAdmin: session.toJSON().user.is_admin,
                userFavoritesIdList: userPosts || [],
            }
        });
    } catch (error) {
        logger.error(error, "USER_TOKEN_VALID_CONTROLLER");

        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.',
            data: {
                isValid: false
            }
        });
    }
};