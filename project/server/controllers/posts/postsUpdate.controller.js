const postsService = require("../../services/posts/postsUpdate.service");
const logger = require("../../utils/logger");

module.exports = async function handlePostUpdate(req, res) {
    try {
        const postId = req.params.id;
        const userId = req.userData.user.id;
        const isAdmin = req.userData.user.is_admin;
        const postData = req.body;

        await postsService.updatePost(postId, postData, userId, isAdmin);

        return res.status(200).json({
            success: true,
            code: "POST_UPDATED",
            status: 200,
            message: "Пост успешно обновлен."
        });
    } catch (error) {
        logger.error(error, "POSTS_UPDATE_CONTROLLER");

        let status = 500;
        let code = 'SERVER_ERROR';
        let message = 'Серверная ошибка. Попробуйте позже.';

        if (error.message === 'POST_NOT_FOUND') {
            status = 404;
            code = 'POST_NOT_FOUND';
            message = 'Пост не найден.';
        } else if (error.message === 'ACCESS_DENIED') {
            status = 403;
            code = 'ACCESS_DENIED';
            message = 'У вас нет прав для редактирования этого поста.';
        }

        return res.status(status).json({
            success: false,
            code,
            status,
            message
        });
    }
};