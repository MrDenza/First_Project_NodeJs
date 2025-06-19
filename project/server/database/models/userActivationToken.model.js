const { DataTypes } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize) => {
    const UserActivationToken = sequelize.define('UserActivationToken', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        activation_token: {
            type: DataTypes.STRING(64),
            allowNull: false,
            defaultValue: () => crypto.randomBytes(32).toString('hex'),
            unique: true
        },
        temp_auth_token: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique: true
        },
        ip_address: {
            type: DataTypes.STRING(45),
            validate: {
                isIP: true
            }
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP + INTERVAL 1 HOUR')
        }
    }, {
        tableName: 'user_activation_tokens',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                name: 'idx_activation_token',
                fields: ['activation_token'],
                unique: true
            },
            {
                name: 'idx_temp_auth_token',
                fields: ['temp_auth_token'],
                unique: true
            },
            {
                name: 'idx_activation_expires',
                fields: ['expires_at']
            }
        ],
        hooks: {
            beforeCreate: (token) => {
                if (!token.expires_at) {
                    token.expires_at = new Date(Date.now() + 3600000); // 1 час
                }
            }
        }
    });

    UserActivationToken.associate = (models) => {
        UserActivationToken.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
            onDelete: 'CASCADE'
        });
    };

    // Методы экземпляра
    UserActivationToken.prototype.isExpired = function() {
        return new Date() > this.expires_at;
    };

    UserActivationToken.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());

        if (values.user && typeof values.user.toJSON === 'function') {
            values.user = values.user.toJSON();
        }

        return values;
    };

    return UserActivationToken;
};

/*
CREATE TABLE user_activation_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activation_token VARCHAR(64) NOT NULL,
    temp_auth_token VARCHAR(36) NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 HOUR),

    -- Внешние ключи
    CONSTRAINT fk_activation_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- Уникальные ограничения
    CONSTRAINT uq_activation_token UNIQUE (activation_token),
    CONSTRAINT uq_temp_auth_token UNIQUE (temp_auth_token),

    -- Проверки данных
    CONSTRAINT chk_activation_token_length CHECK (CHAR_LENGTH(activation_token) = 64),
    CONSTRAINT chk_temp_auth_token_format CHECK (temp_auth_token REGEXP '^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'),

    -- Индексы
    INDEX idx_activation_tokens_user (user_id),
    INDEX idx_activation_tokens_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Токены активации аккаунтов';
*/