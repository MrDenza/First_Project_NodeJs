const db = require('../../database/database');

module.exports = {
    async updatePost(postId, postData, userId, isAdmin) {
        return db.repositories.Post.updatePost(postId, postData, userId, isAdmin);
    }
};