const db = require('../../database/database');
const logger = require("../../utils/logger");

module.exports = {
    async getUserPosts(userId) {
        try {
            const posts = await db.repositories.Post.getPostsByAuthor(userId);

            return posts.map(post => ({
                id: post.id,
                title: post.title,
                description: post.description,
                status: post.status,
                createdAt: post.created_at,
                updatedAt: post.updated_at,
                author: {
                    id: post.author?.id,
                    username: post.author?.username
                }
            }));
        } catch (error) {
            logger.error(error, `POSTS_USER_LIST_SERVICE`);
            return [];
        }
    }
};