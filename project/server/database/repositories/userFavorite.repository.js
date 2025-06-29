module.exports = (models) => ({
    // Добавляет пост в избранное пользователя

    async addFavorite(userId, postId) {
        return models.UserFavorite.findOrCreate({
            where: { user_id: userId, post_id: postId },
            defaults: {
                user_id: userId,
                post_id: postId,
            },
        }).then(([favorite, created]) => {
            if (!created) throw new Error("Пост уже в избранном");
            return favorite;
        });
    },

    // Удаляет пост из избранного пользователя
    async removeFavorite(userId, postId) {
        return models.UserFavorite.destroy({
            where: {
                user_id: userId,
                post_id: postId,
            },
        });
    },

    // Получает все избранные посты пользователя
    async getUserFavorites(userId) {
        return models.UserFavorite.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: models.Post,
                    as: 'post',
                    include: [
                        {
                            model: models.User,
                            as: 'author',
                            attributes: ['id', 'username']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });
    },

    // Получает массив id всех избранных постов пользователя
    async getUserFavoritePostIds(userId) {
        const favorites = await models.UserFavorite.findAll({
            where: { user_id: userId },
            attributes: ['post_id'],
            order: [['created_at', 'DESC']],
            raw: true, // чтобы получить "плоский" массив объектов
        });
        // Возвращаем только массив id
        return favorites.map(fav => fav.post_id);
    },

    // Получает пользователей, добавивших пост в избранное
    // async getPostFavoritedBy(postId, options = {}) {
    //     const { limit = 10, offset = 0 } = options;
    //
    //     return models.User.findAll({
    //         include: [
    //             {
    //                 model: models.UserFavorite,
    //                 as: "favorite_posts",
    //                 where: { post_id: postId },
    //                 attributes: [],
    //                 required: true,
    //             },
    //         ],
    //         order: [[{ model: models.UserFavorite, as: "favorite_posts" }, "created_at", "DESC"]],
    //         limit,
    //         offset,
    //     });
    // },
});
