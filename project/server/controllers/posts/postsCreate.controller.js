const postsService = require("../../services/posts/postsCreate.service");
const logger = require("../../utils/logger");

module.exports = async function handlePostsCreate (req, res) {

    let userData;
    try {
        userData = req.userData;

        const postId = await postsService.createNewPost(req.body, userData.user.id);
        if (!postId) {
            return res.status(500).json({
                success: false,
                code: "POST_CREATED_ERROR",
                status: 500,
                message: "Ошибка создания нового поста.",
            });
        }

        return res.status(200).json({
            success: true,
            code: "POST_CREATE",
            status: 200,
            message: "Черновой пост создан.",
            data: {
                postId: postId,
            },
        });
    } catch (error) {
        logger.error(error, "POSTS_CREATE_CONTROLLER");
        const errorBody = {
            success: false,
            code: "SERVER_ERROR",
            status: 500,
            message: "Серверная ошибка. Попробуйте позже.",
        };
        return res.status(500).json(errorBody);
    }
};