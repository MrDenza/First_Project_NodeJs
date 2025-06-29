module.exports = (models) => ({
    // Обновляет блок контента
    async updateBlock(blockId, updateData, transaction = null) {
        const options = {};
        if (transaction) options.transaction = transaction;

        const block = await models.PostBlock.findByPk(blockId, options);
        if (!block) throw new Error("Блок не найден");

        return block.update(updateData, options);
    },

    // Удаляет блок контента
    async deleteBlock(blockId) {
        return models.PostBlock.destroy({
            where: { id: blockId },
        });
    },
});