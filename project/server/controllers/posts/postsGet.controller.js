const postsService = require('../../services/posts/postsGet.service');
const logger = require("../../utils/logger");

module.exports = async function handlePostsGet(req, res) {
    try {
        const postId = req.params.id;
        if (!postId) {
            return res.status(400).json({
                success: false,
                code: 'MISSING_POST_ID',
                status: 400,
                message: 'Не указан идентификатор поста.'
            });
        }

        const post = await postsService.getPostById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                code: 'POST_NOT_FOUND',
                status: 404,
                message: 'Пост не найден.'
            });
        }

        return res.status(200).json({
            success: true,
            code: 'POST_SUCCESS',
            status: 200,
            message: 'Информация о запрощеном посте.',
            data: post
        });
    } catch (error) {
        logger.error(error, "POSTS_GET_CONTROLLER");
        if (error.message === 'Пост не найден') {
            return res.status(404).json({
                success: false,
                code: 'POST_NOT_FOUND',
                status: 404,
                message: 'Пост не найден.'
            });
        }

        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.'
        });
    }
};