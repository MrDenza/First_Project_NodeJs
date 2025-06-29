const activationService = require('../../services/auth/userActivation.service');
const { REFRESH_EXP_TOKEN } = require("../../config/server.config");
const logger = require("../../utils/logger");

module.exports = async function handleActivation (req, res) {
    const { token } = req.query;

    let errorRes = (status, message) => {
        return res.redirect(`/error?code=${status}&message=${encodeURIComponent(message)}`);
    };

    try {
        // Проверка входных данных
        if (!token) {
            const errorBody = {
                success: false,
                code: 'ACTIVATION_TOKEN_MISSING',
                status: 400,
                message: "Отсутствуют данные для активации аккаунта.",
            }
            return errorRes(errorBody.status, errorBody.message);
        }

        // Проверка валидности токена
        const activationRecord  = await activationService.validateActivationToken(token);
        if (!activationRecord) {
            const errorBody = {
                success: false,
                code: 'INVALID_ACTIVATION_TOKEN',
                status: 400,
                message: 'Неверная ссылка активации. Запросите новую ссылку.'
            }
            return errorRes(errorBody.status, errorBody.message);
        }

        // Проверка срока действия токена активации
        if (activationRecord.isExpired()) {
            const errorBody = {
                success: false,
                code: 'EXPIRED_ACTIVATION_TOKEN',
                status: 410,
                message: 'Срок действия ссылка активации истёк. Запросите новую ссылку.'
            }
            return errorRes(errorBody.status, errorBody.message);
        }

        // Проверка статуса аккаунта
        if (activationRecord.toJSON().user.is_active) {
            const errorBody = {
                success: false,
                code: 'ACCOUNT_ALREADY_ACTIVE',
                status: 409,
                message: 'Аккаунт уже активирован.'
            }
            return errorRes(errorBody.status, errorBody.message);
        }

        // Активация пользователя
        const clientIp = req.ip;

        const { rToken } = await activationService.activateUserAccount(activationRecord.toJSON().user.id, clientIp);
        if (!rToken) {
            const errorBody = {
                success: false,
                code: 'AUTHORIZATION_ERROR',
                status: 500,
                message: 'Не удалось авторизоваться. Попробуйте позже.',
            }
            return errorRes(errorBody.status, errorBody.message);
        }

        res.cookie('refreshToken', rToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: REFRESH_EXP_TOKEN
        });

        // Редирект домой
        res.redirect(`/`);

    } catch (error) {
        logger.error(error, "USER_ACTIVATED_CONTROLLER");

        const errorBody = {
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.'
        }

        return errorRes(errorBody.status, errorBody.message);
    }
};