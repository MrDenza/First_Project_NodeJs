const db = require('../../database/database');

module.exports = {
    // Проверка наличия активной сессии по токену
    async findUserForAccessToken(accessToken) {
        return db.repositories.Session.findByAccessToken(accessToken);
    },

    // Создание поста
    async createNewPost(postData, userId) {
        try {
            return await db.repositories.Post.createPost(postData, userId);;
        } catch (error) {
            throw error;
        }
    }
};