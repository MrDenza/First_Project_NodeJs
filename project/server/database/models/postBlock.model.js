const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PostBlock = sequelize.define('PostBlock', {
        id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        type: {
            type: DataTypes.ENUM('text', 'heading', 'image', 'video', 'divider'),
            allowNull: false,
            validate: {
                isIn: {
                    args: [['text', 'heading', 'image', 'video', 'divider']],
                    msg: 'Недопустимый тип блока'
                }
            }
        },
        content: {
            type: DataTypes.TEXT,
            get() {
                const rawValue = this.getDataValue('content');
                return rawValue ? rawValue : null;
            }
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: {
                    args: [0],
                    msg: 'Порядок не может быть отрицательным'
                }
            }
        },
        formatting: {
            type: DataTypes.JSON,
            defaultValue: {}
        }
    }, {
        tableName: 'post_blocks',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                name: 'idx_block_post_order',
                fields: ['post_id', 'order']
            }
        ]
    });

    PostBlock.associate = (models) => {
        PostBlock.belongsTo(models.Post, {
            foreignKey: 'post_id',
            as: 'post',
            onDelete: 'CASCADE'
        });

        PostBlock.hasOne(models.PostImage, {
            foreignKey: 'block_id',
            as: 'image',
            onDelete: 'CASCADE'
        });
    };

    PostBlock.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());

        if (values.user && typeof values.user.toJSON === 'function') {
            values.user = values.user.toJSON();
        }

        return values;
    };

    return PostBlock;
};

/*
CREATE TABLE `post_blocks` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID блока',
    `type` ENUM('text', 'heading', 'image') NOT NULL,
    `content` TEXT,
    `order` INT NOT NULL DEFAULT 0,
    `formatting` JSON NOT NULL,
    `post_id` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Первичный ключ
    PRIMARY KEY (`id`),

    -- Индексы
    INDEX `idx_block_post_order` (`post_id`, `order`),

    -- Внешние ключи
    CONSTRAINT `fk_post_blocks_post`
        FOREIGN KEY (`post_id`)
        REFERENCES `posts` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 */