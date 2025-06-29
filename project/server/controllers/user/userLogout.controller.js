const logoutService = require('../../services/auth/userLogout.service');
const logger = require("../../utils/logger");

module.exports = async function handleUserLogout(req, res) {
    const refreshToken = req.cookies.refreshToken || null;
    const authHeader = req.headers.authorization || '';
    const accessToken = authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : req.body.accessToken;

    try {
        // Всегда очищаем куки
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        // Если нет refresh токена - просто подтверждаем выход
        // if (!refreshToken) {
        //     return res.status(200).json({
        //         success: true,
        //         code: 'LOGOUT_SUCCESS',
        //         status: 200,
        //         message: 'Сеанс завершен'
        //     });
        // }

        // Валидация refresh токена
        // const isValidRefToken = await logoutService.validRefreshToken(refreshToken);
        // if (!isValidRefToken) {
        //     return res.status(200).json({
        //         success: true,
        //         code: 'LOGOUT_SUCCESS',
        //         status: 200,
        //         message: 'Сеанс завершен (токен недействителен).',
        //     });
        // }

        // Удаляем сессию пользователя
        const isDeleteSession = await logoutService.logoutUser(refreshToken, accessToken);
        if (!isDeleteSession) {
            console.error('Ошибка удаления сессии. Refresh: ', refreshToken);
        }

        return res.json({
            success: true,
            code: 'LOGOUT_SUCCESS',
            status: 200,
            message: 'Сеанс успешно завершен.',
        });

    } catch (error) {
        logger.error(error, "USER_LOGOUT_CONTROLLER");

        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.'
        });
    }
};