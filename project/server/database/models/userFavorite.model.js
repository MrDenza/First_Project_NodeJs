module.exports = (sequelize) => {
    const UserFavorite = sequelize.define('UserFavorite', {}, {
        tableName: 'user_favorites',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                name: 'idx_favorite_user_post',
                fields: ['user_id', 'post_id'],
                unique: true
            },
            {
                name: 'idx_favorite_user_date',
                fields: ['user_id', 'created_at']
            }
        ]
    });

    UserFavorite.associate = (models) => {
        UserFavorite.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
            onDelete: 'CASCADE'
        });

        UserFavorite.belongsTo(models.Post, {
            foreignKey: 'post_id',
            as: 'post',
            onDelete: 'CASCADE'
        });
    };

    UserFavorite.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());

        if (values.user && typeof values.user.toJSON === 'function') {
            values.user = values.user.toJSON();
        }

        return values;
    };

    return UserFavorite;
};

/*
CREATE TABLE `user_favorites` (
    `user_id` INT NOT NULL,
    `post_id` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Первичный ключ (составной)
    PRIMARY KEY (`user_id`, `post_id`),

    -- Индексы
    UNIQUE INDEX `idx_favorite_user_post` (`user_id`, `post_id`),
    INDEX `idx_favorite_user_date` (`user_id`, `created_at`),

    -- Внешние ключи
    CONSTRAINT `fk_user_favorites_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT `fk_user_favorites_post`
        FOREIGN KEY (`post_id`)
        REFERENCES `posts` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 */