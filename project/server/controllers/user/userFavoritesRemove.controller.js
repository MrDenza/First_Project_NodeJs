const favoritesService = require("../../services/favorites/userFavorites.service");
const logger = require("../../utils/logger");

module.exports = async function handleFavoriteRemove(req, res) {
    try {
        const postId = req.params.id;
        const userId = req.userData.user.id;

        await favoritesService.removeFavorite(userId, postId);

        const userPosts = await favoritesService.getUserPosts(userId);

        return res.status(200).json({
            success: true,
            code: "FAVORITE_REMOVED",
            status: 200,
            message: "Пост удален из избранного.",
            data: {
                userFavoritesIdList: userPosts || [],
            }
        });
    } catch (error) {
        logger.error(error, "USER_FAVORITES_REMOVE_CONTROLLER");

        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.'
        });
    }
};