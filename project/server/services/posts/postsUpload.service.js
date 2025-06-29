const db = require('../../database/database');
const logger = require("../../utils/logger");

module.exports = {
    // Проверка есть ли пост
    async findPost(postId) {
        return await db.repositories.Post.getPostById(postId, false, false, false);
    },

    // Находим блок изображения по block_id
    async findBlockImageForBlockId(blockId) {
        return await db.repositories.PostImage.getImageByBlock(blockId);
    },

    // Обновляем информацию о загруженном изображении
    async updateImageInfo(blockImageId, blockId, serverName, fileFullPath, fileRelativePath) {
        const transaction = await db.sequelize.transaction();
        try {
            await db.repositories.PostImage.updateImage(blockImageId, {server_name: serverName, file_path: fileFullPath}, transaction);
            await db.repositories.PostBlock.updateBlock(blockId, {content: fileRelativePath}, transaction);
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            logger.error(error, `POSTS_UPLOAD_SERVICE`);
            return false;
        }
    }
};