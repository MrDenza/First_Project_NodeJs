const db = require('../../database/database');
const logger = require("../../utils/logger");

module.exports = {
    async getUserFavorites(userId) {
        try {
            const favorites = await db.repositories.UserFavorite.getUserFavorites(userId);

            return favorites.map(fav => ({
                id: fav.post.id,
                title: fav.post.title,
                description: fav.post.description,
                status: fav.post.status,
                createdAt: fav.post.created_at,
                author: {
                    id: fav.post.author?.id,
                    username: fav.post.author?.username
                },
                favoritedAt: fav.created_at
            }));
        } catch (error) {
            logger.error(error, `POSTS_FAVORITES_SERVICE`);
            return [];
        }
    }
};