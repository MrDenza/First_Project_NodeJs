const postsUserService = require('../../services/posts/postsUser.service');
const logger = require("../../utils/logger");

module.exports = async function handleUserPostsGet(req, res) {
    try {
        const userId = req.userData.user.id;
        const posts = await postsUserService.getUserPosts(userId);

        return res.status(200).json({
            success: true,
            code: 'USER_POSTS_SUCCESS',
            status: 200,
            message: 'Список постов пользователя.',
            data: posts
        });
    } catch (error) {
        logger.error(error, "POSTS_USER_LIST_CONTROLLER");

        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.'
        });
    }
};