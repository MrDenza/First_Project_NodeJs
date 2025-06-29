const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Post = sequelize.define('Post', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Заголовок не может быть пустым'
                },
                len: {
                    args: [3, 255],
                    msg: 'Заголовок должен быть от 3 до 255 символов'
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            validate: {
                len: {
                    args: [0, 2000],
                    msg: 'Описание не должно превышать 2000 символов'
                }
            }
        },
        keywords: {
            type: DataTypes.STRING(255),
            validate: {
                len: {
                    args: [0, 255],
                    msg: 'Ключевые слова не должны превышать 255 символов'
                }
            }
        },
        status: {
            type: DataTypes.ENUM('draft', 'published', 'archived'),
            defaultValue: 'draft',
            validate: {
                isIn: {
                    args: [['draft', 'published', 'archived']],
                    msg: 'Недопустимый статус поста'
                }
            }
        },
        searchContent: {
            type: DataTypes.VIRTUAL,
            get() {
                const textBlocks = this.blocks
                .filter(b => ['text', 'heading'].includes(b.type))
                .map(b => b.content)
                .join(' ');

                return `${this.title} ${this.description} ${this.keywords} ${textBlocks}`;
            }
        }
    }, {
        tableName: 'posts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: 'idx_post_status',
                fields: ['status']
            },
            {
                name: 'idx_post_author',
                fields: ['author_id']
            },
            {
                name: 'ft_post_search',
                fields: ['title', 'description', 'keywords'],
                type: 'FULLTEXT'
            }
        ],
        hooks: {
            beforeValidate: (post) => {
                if (post.title) {
                    post.title = post.title.trim();
                }
                if (post.slug) {
                    post.slug = post.slug.trim().toLowerCase();
                }
            }
        }
    });

    Post.associate = (models) => {
        Post.belongsTo(models.User, {
            foreignKey: 'author_id',
            as: 'author',
            onDelete: 'CASCADE'
        });

        Post.hasMany(models.PostBlock, {
            foreignKey: 'post_id',
            as: 'blocks',
            onDelete: 'CASCADE'
        });

        Post.hasMany(models.PostImage, {
            foreignKey: 'post_id',
            as: 'images',
            onDelete: 'CASCADE'
        });

        Post.belongsTo(models.PostImage, {
            foreignKey: 'cover_image_id',
            as: 'cover_image'
        });

        Post.belongsToMany(models.User, {
            through: models.UserFavorite,
            foreignKey: 'post_id',
            as: 'favorited_by'
        });
    };

    Post.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());

        if (values.user && typeof values.user.toJSON === 'function') {
            values.user = values.user.toJSON();
        }

        return values;
    };

    Post.prototype.publish = async function() {
        this.status = 'published';
        return this.save();
    };

    Post.prototype.archive = async function() {
        this.status = 'archived';
        return this.save();
    };


    return Post;
};

/*
CREATE TABLE `posts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `keywords` VARCHAR(255),
    `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `author_id` INT NOT NULL,
    `cover_image_id` INT, -- Временное объявление без FK
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_post_status` (`status`),
    INDEX `idx_post_author` (`author_id`),
    FULLTEXT INDEX `ft_post_search` (`title`, `description`, `keywords`),

    CONSTRAINT `fk_posts_author`
        FOREIGN KEY (`author_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

после создания всех таблиц (post_image, post_favorite, post_block)
ALTER TABLE `posts`
ADD CONSTRAINT `fk_posts_cover_image`
    FOREIGN KEY (`cover_image_id`)
    REFERENCES `post_images` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
 */