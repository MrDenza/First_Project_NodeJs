const db = require('../../database/database');
const fs = require('fs').promises;
const path = require('path');
const { POSTS_UPLOAD_DIR } = require('../../config/paths.config');
const logger = require("../../utils/logger");

module.exports = {
    async deletePostWithFiles(postId, userId, isAdmin) {
        const transaction = await db.sequelize.transaction();

        try {
            const post = await db.models.Post.findByPk(postId, {
                transaction,
                include: [{
                    model: db.models.User,
                    as: "author",
                    attributes: ["id"],
                }]
            });

            if (!post) {
                throw new Error('POST_NOT_FOUND');
            }

            if (post.author.id !== userId && !isAdmin) {
                throw new Error('ACCESS_DENIED');
            }

            const images = await db.models.PostImage.findAll({
                where: { post_id: postId },
                attributes: ['id', 'file_path'],
                transaction
            });

            await db.models.PostBlock.destroy({
                where: { post_id: postId },
                transaction
            });

            await db.models.PostImage.destroy({
                where: { post_id: postId },
                transaction
            });

            await db.models.UserFavorite.destroy({
                where: { post_id: postId },
                transaction
            });

            await db.models.Post.destroy({
                where: { id: postId },
                transaction,
            });

            await transaction.commit();

            // Удаляем файлы после успешного коммита
            try {
                // Удаляем файлы
                await Promise.all(images.map(image =>
                    image.file_path && fs.rm(image.file_path, { force: true })
                ));

                // Удаляем папку
                const postDir = path.join(POSTS_UPLOAD_DIR, String(postId));
                await fs.rm(postDir, {
                    recursive: true,
                    force: true
                });
            } catch (fileError) {
                logger.error(fileError, `POSTS_DELETE_SERVICE | Ошибка удаления файлов`);
            }

            return true;
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            throw error;
        }
    }
};