const postsService = require("../../services/posts/postsDelete.service");
const logger = require("../../utils/logger");

module.exports = async function handlePostDelete(req, res) {
    try {
        const postId = req.params.id;
        const userId = req.userData.user.id;
        const isAdmin = req.userData.user.is_admin;

        await postsService.deletePostWithFiles(postId, userId, isAdmin);

        return res.status(200).json({
            success: true,
            code: "POST_DELETED",
            status: 200,
            message: "Пост успешно удален."
        });
    } catch (error) {
        logger.error(error, "POSTS_DELETE_CONTROLLER");
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
            message = 'У вас нет прав для удаления этого поста.';
        }

        return res.status(status).json({
            success: false,
            code,
            status,
            message
        });
    }
};