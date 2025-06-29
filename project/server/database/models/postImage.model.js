const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PostImage = sequelize.define('PostImage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        original_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Имя файла не может быть пустым'
                }
            }
        },
        server_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        file_path: {
            type: DataTypes.STRING(512),
            allowNull: true,
        },
        file_size: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: {
                    args: [1],
                    msg: 'Размер файла должен быть больше 0'
                }
            }
        },
        mime_type: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                is: {
                    args: /^[a-z]+\/[a-z0-9-+.]+$/,
                    msg: 'Недопустимый MIME-тип'
                }
            }
        },
        alt_text: {
            type: DataTypes.STRING(255),
            validate: {
                len: {
                    args: [0, 255],
                    msg: 'Альтернативный текст не должен превышать 255 символов'
                }
            }
        },
        width: {
            type: DataTypes.INTEGER,
            validate: {
                min: {
                    args: [1],
                    msg: 'Ширина должна быть больше 0'
                }
            }
        },
        height: {
            type: DataTypes.INTEGER,
            validate: {
                min: {
                    args: [1],
                    msg: 'Высота должна быть больше 0'
                }
            }
        },
        file_key: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Ключ файла не может быть пустым'
                }
            }
        },
    }, {
        tableName: 'post_images',
        timestamps: true,
        createdAt: 'uploaded_at',
        updatedAt: false,
        indexes: [
            {
                name: 'idx_image_post',
                fields: ['post_id']
            },
            {
                name: 'idx_image_block',
                fields: ['block_id'],
                unique: true
            }
        ]
    });

    PostImage.associate = (models) => {
        PostImage.belongsTo(models.Post, {
            foreignKey: 'post_id',
            as: 'post',
            onDelete: 'CASCADE'
        });

        PostImage.belongsTo(models.PostBlock, {
            foreignKey: 'block_id',
            as: 'block',
            onDelete: 'CASCADE'
        });

        PostImage.hasMany(models.Post, {
            foreignKey: 'cover_image_id',
            as: 'cover_posts'
        });
    };

    PostImage.prototype.getDimensions = function() {
        return `${this.width}x${this.height}`;
    };

    PostImage.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());

        if (values.user && typeof values.user.toJSON === 'function') {
            values.user = values.user.toJSON();
        }

        return values;
    };

    return PostImage;
};

/*
CREATE TABLE `post_images` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `original_name` VARCHAR(255) NOT NULL,
    `server_name` VARCHAR(255),
    `file_key` VARCHAR(255) NOT NULL,
    `file_path` VARCHAR(512),
    `file_size` INT NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `alt_text` VARCHAR(255),
    `width` INT,
    `height` INT,
    `post_id` INT NOT NULL,
    `block_id` CHAR(36) NOT NULL,
    `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Уникальные ограничения
    UNIQUE KEY `idx_image_block` (`block_id`),

    -- Индексы
    INDEX `idx_image_post` (`post_id`),

    -- Внешние ключи
    CONSTRAINT `fk_post_images_post`
        FOREIGN KEY (`post_id`)
        REFERENCES `posts` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT `fk_post_images_block`
        FOREIGN KEY (`block_id`)
        REFERENCES `post_blocks` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 */