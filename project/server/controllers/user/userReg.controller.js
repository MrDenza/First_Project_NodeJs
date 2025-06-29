const registrationService = require('../../services/auth/userReg.service');
const logger = require("../../utils/logger");

module.exports = async function handleUserRegistration(req, res) {
    const { username, email, password } = req.body;

    try {
        // Валидация входных данных
        const validationErrors = await registrationService.validateUserData({ username, email, password });
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                success: false,
                code: 'VALIDATION_ERROR',
                status: 400,
                message: "Проверьте введённые данные.",
                data: {
                    errors: validationErrors,
                }
            });
        }

        // Проверка существования пользователя
        const { usernameExists, emailExists } = await registrationService.checkUserUniqueness(username, email);
        if (usernameExists || emailExists) {
            return res.status(409).json({
                success: false,
                code: 'USER_EXISTS',
                status: 409,
                message: 'Пользователь с такими данными уже существует.'
            });
        }

        // Регистрация
        const clientIp = req.ip;

        const { user, tempAuthToken } = await registrationService.registerUser({ username, email, password }, clientIp);
        if (!user && !tempAuthToken) {
            return res.status(500).json({
                success: false,
                code: 'REGISTRATION_ERROR',
                status: 500,
                message: 'Не удалось завершить регистрацию. Попробуйте позже.'
            });
        }

        // Успешная регистрация
        return res.status(201).json({
            success: true,
            code: 'REGISTRATION_SUCCESS',
            status: 201,
            message: 'Успешная регистрация. Проверьте почту.',
            data: {
                isVerified: user.is_active,
                tempAuthToken
            }
        });

    } catch (error) {
        logger.error(error, "USER_REG_CONTROLLER");

        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.'
        });
    }
};