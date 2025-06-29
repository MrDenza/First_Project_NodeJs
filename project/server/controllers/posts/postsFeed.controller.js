const postsFeedService = require('../../services/posts/postsFeed.service');
const logger = require("../../utils/logger");

module.exports = async function handleFeedGet(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const feedData = await postsFeedService.getFeedPosts(page, limit);

        return res.status(200).json({
            success: true,
            code: 'FEED_SUCCESS',
            status: 200,
            message: 'Лента постов',
            data: {
                ...feedData
            }
        });
    } catch (error) {
        logger.error(error, "POSTS_FEED_CONTROLLER");

        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.'
        });
    }
};