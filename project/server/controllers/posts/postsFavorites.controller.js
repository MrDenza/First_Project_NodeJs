const postsFavoritesService = require('../../services/posts/postsFavorites.service');
const logger = require("../../utils/logger");

module.exports = async function handleUserFavoritesGet(req, res) {
    try {
        const userId = req.userData.user.id;
        const favorites = await postsFavoritesService.getUserFavorites(userId);

        return res.status(200).json({
            success: true,
            code: 'USER_FAVORITES_SUCCESS',
            status: 200,
            message: 'Список избранных постов пользователя.',
            data: favorites
        });
    } catch (error) {
        logger.error(error, "POSTS_FAV_CONTROLLER");

        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.'
        });
    }
};