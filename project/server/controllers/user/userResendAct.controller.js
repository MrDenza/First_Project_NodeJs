const resendActivationService = require('../../services/auth/userResendAct.service');
const logger = require("../../utils/logger");

module.exports = async function handleResendActivation(req, res) {
    const { tempAuthToken } = req.body;

    if (!tempAuthToken) {
        return res.status(400).json({
            success: false,
            code: 'MISSING_TOKEN',
            status: 400,
            message: 'Ошибка сессии. Авторизуйтесь повторно.'
        });
    }

    try {
        // Проверка валидности токена
        const activationRecord = await resendActivationService.validateTempToken(tempAuthToken);
        if (!activationRecord) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_TOKEN',
                status: 401,
                message: "Ошибка сессии. Авторизуйтесь повторно.",
            });
        }

        // Проверка активирован ли пользователь
        const user = await resendActivationService.getUserForActivation(activationRecord.user_id);
        if (user.is_active) {
            return res.status(401).json({
                success: false,
                code: 'USER_IS_ACTIVE',
                status: 401,
                message: "Аккаунт уже активирован. Авторизуйтесь.",
                data: {
                    isVerified: true,
                }
            });
        }

        // Отправка письма активации
        const resultResend = await resendActivationService.resendActivationEmail(user, activationRecord.id);
        if (!resultResend) {
            return res.status(500).json({
                success: false,
                code: 'RESEND_ACTIVATION_ERROR',
                status: 500,
                message: 'Не удалось отправить письмо. Попробуйте позже.'
            });
        }

        return res.json({
            success: true,
            code: 'USER_IS_ACTIVE',
            status: 200,
            message: 'Письмо с активацией отправлено на вашу почту.',
            data: {
                isVerified: false,
                tempAuthToken,
            }
        });

    } catch (error) {
        logger.error(error, "USER_RESEND_ACTIVATION_CONTROLLER");

        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.'
        });
    }
};