module.exports = (models) => ({
    // Обновляет запись об изображении
    async updateImage(imageId, updateData, transaction = null) {
        const options = {};
        if (transaction) options.transaction = transaction;

        const image = await models.PostImage.findByPk(imageId, options);
        if (!image) throw new Error("Изображение не найдено");

        return image.update(updateData, options);
    },

    // Удаляет запись об изображении
    // async deleteImage(imageId) {
    //     return models.PostImage.destroy({
    //         where: { id: imageId },
    //     });
    // },

    // Получает изображение по ID блока
    async getImageByBlock(blockId) {
        return models.PostImage.findOne({
            where: { block_id: blockId },
            include: [
                {
                    model: models.Post,
                    as: "post",
                    attributes: ["id", "title"],
                },
            ],
        });
    },

    // Удаляет все изображения поста
    // async deleteImagesByPost(postId) {
    //     return models.PostImage.destroy({
    //         where: { post_id: postId },
    //     });
    // },

    // Обновляет альтернативный текст изображения
    // async updateAltText(imageId, altText) {
    //     const image = await models.PostImage.findByPk(imageId);
    //     if (!image) throw new Error("Изображение не найдено");
    //     return image.update({ alt_text: altText });
    // },
});