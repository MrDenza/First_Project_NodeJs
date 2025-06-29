const authService = require('../../services/auth/userLogin.service');
const { REFRESH_EXP_TOKEN } = require("../../config/server.config");
const favoritesService = require("../../services/favorites/userFavorites.service");
const logger = require("../../utils/logger");

module.exports = async function handleLogin(req, res) {
    const { login, password } = req.body;

    try {
        // Валидация входных данных
        const validateReqBody = await authService.validateUserData({ login, password });
        if (Object.keys(validateReqBody).length > 0) {
            return res.status(400).json({
                success: false,
                code: 'VALIDATION_ERROR',
                status: 400,
                message: "Проверьте введённые данные.",
                data: {
                    errors: validateReqBody,
                }
            });
        }

        // Проверка существует ли пользователь
        const user = await authService.findUserByLogin(login);
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                status: 404,
                message: 'Пользователь не найден.'
            });
        }

        // Проверка пароля пользователя
        const isPasswordValid = await authService.verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_CREDENTIALS',
                status: 401,
                message: 'Введен неверный email или пароль.'
            });
        }

        // Проверка активирован ли пользователь
        const clientInfo = {
            ip_address: req.ip,
            //device_info: req.device_info || "Информация отсутствует",
        };

        if (!user.is_active) {
            const { tempAuthToken } = await authService.generateTempAuthToken(user, clientInfo.ip_address);
            return res.status(403).json({
                success: false,
                code: 'ACCOUNT_NOT_ACTIVATED',
                status: 403,
                message: 'Ваш аккаунт не активирован. Проверьте Вашу почту.',
                data: {
                    isVerified: user.is_active,
                    tempAuthToken,
                }
            });
        }

        // Создание сессии и токенов
        const { accessToken, refreshToken } = await authService.createUserSession(user, clientInfo);
        if (!accessToken || !refreshToken) {
            return res.status(500).json({
                success: false,
                code: 'AUTHORIZATION_ERROR',
                status: 500,
                message: 'Не удалось авторизоваться. Попробуйте позже.',
            });
        }

        const userPosts = await favoritesService.getUserPosts(user.id);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: REFRESH_EXP_TOKEN * 1000
        });

        // Успешная авторизация
        return res.status(200).json({
            success: true,
            code: 'AUTHORIZATION_SUCCESS',
            status: 200,
            message: 'Успешная авторизация.',
            data: {
                username: user.username,
                accessToken,
                isVerified: user.is_active,
                isAdmin: user.is_admin,
                userFavoritesIdList: userPosts || [],
            }
        });

    } catch (error) {
        logger.error(error, "USER_LOGIN_CONTROLLER");

        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.'
        });
    }
};

    // async logout(req, res) {
    //     try {
    //         await authService.logoutUser(req.user.id, req.session.id);
    //         res.clearCookie('refreshToken');
    //         res.json({ success: true });
    //     } catch (error) {
    //         console.error('Logout error:', error);
    //         res.status(500).json({
    //             success: false,
    //             code: 'LOGOUT_ERROR'
    //         });
    //     }
    // }