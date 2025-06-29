const favoritesService = require("../../services/favorites/userFavorites.service");
const logger = require("../../utils/logger");

module.exports = async function handleFavoriteAdd(req, res) {
    try {
        const postId = req.params.id;
        const userId = req.userData.user.id;

        await favoritesService.addFavorite(userId, postId);

        const userPosts = await favoritesService.getUserPosts(userId);

        return res.status(200).json({
            success: true,
            code: "FAVORITE_ADDED",
            status: 200,
            message: "Пост добавлен в избранное.",
            data: {
                userFavoritesIdList: userPosts || [],
            }
        });
    } catch (error) {
        logger.error(error, "USER_FAVORITES_ADD_CONTROLLER");

        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.'
        });
    }
};