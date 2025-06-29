const db = require('../../database/database');

module.exports = {
    async addFavorite(userId, postId) {
        return db.repositories.UserFavorite.addFavorite(userId, postId);
    },

    async removeFavorite(userId, postId) {
        return db.repositories.UserFavorite.removeFavorite(userId, postId);
    },

    // async isFavorite(userId, postId) {
    //     return db.repositories.UserFavorite.isFavorite(userId, postId);
    // },

    async getUserPosts(userId) {
        return db.repositories.UserFavorite.getUserFavoritePostIds(userId);
    }
};