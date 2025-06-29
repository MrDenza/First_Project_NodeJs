const tokenService = require("../services/token.service");
const postsService = require("../services/posts/postsCreate.service");
const logger = require("../utils/logger");

module.exports = async function authCheck(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null;

        if (!accessToken) {
            logger.warn(`AUTH_MIDDLEWARE | Отказано в доступе (нет А токена) ${accessToken}`);
            return res.status(401).json({
                success: false,
                code: 'TOKENS_MISSING',
                status: 401,
                message: 'Отказано в доступе.',
            });
        }

        const isVerify = await tokenService.verifyTokenAsync(accessToken)
        const isTokenExp = tokenService.isTokenFreshAsync(accessToken)

        if (!isVerify || !isTokenExp) {
            logger.warn(`AUTH_MIDDLEWARE | Отказано в доступе (невалид А токена) ${accessToken}`);
            return res.status(403).json({
                success: false,
                code: 'INVALID_ACCESS_TOKEN',
                status: 403,
                message: 'Отказано в доступе.',
            });
        }

        const userData = await postsService.findUserForAccessToken(accessToken);
        if (!userData) {
            logger.warn(`AUTH_MIDDLEWARE | Отказано в доступе (нет сессии по А токену) ${accessToken}`);
            return res.status(403).json({
                success: false,
                code: 'SESSION_NOT_FOUND',
                status: 403,
                message: 'Отказано в доступе.',
            });
        }

        req.userData = userData;

        next();
    } catch (e) {
        logger.error(e, `AUTH_MIDDLEWARE`);

        const errorBody = {
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.'
        }
        return res.status(500).json(errorBody);
    }
};