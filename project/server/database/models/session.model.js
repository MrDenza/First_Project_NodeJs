const { DataTypes } = require('sequelize');
const { REFRESH_EXP_TOKEN } = require("../../config/server.config");

module.exports = (sequelize) => {
    const Session = sequelize.define('Session', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        access_token: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        ip_address: {
            type: DataTypes.STRING(45),
            validate: {
                isIP: true
            }
        },
        device_info: {
            type: DataTypes.STRING(255)
        },
        user_agent: {
            type: DataTypes.TEXT
        },
        is_revoked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP + INTERVAL 30 DAY') // = REFRESH_EXP_TOKEN
        }
    }, {
        tableName: 'sessions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: 'idx_session_user',
                fields: ['user_id']
            },
            {
                name: 'idx_session_token',
                fields: ['token_hash'],
                unique: true
            },
            {
                name: 'idx_session_expires',
                fields: ['expires_at']
            }
        ],
        hooks: {
            beforeCreate: (session) => {
                const exp = REFRESH_EXP_TOKEN || 30 * 24 * 60 * 60 * 1000;
                if (!session.expires_at) {
                    session.expires_at = new Date(Date.now() + exp);
                }
            }
        }
    });

    Session.associate = (models) => {
        Session.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
            onDelete: 'CASCADE'
        });
    };

    Session.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());

        if (values.user && typeof values.user.toJSON === 'function') {
            values.user = values.user.toJSON();
        }

        return values;
    };

    return Session;
};

/*
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    ip_address VARCHAR(45),
    device_info VARCHAR(255),
    user_agent TEXT,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 30 DAY),

    -- Внешние ключи
    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- Уникальные ограничения
    CONSTRAINT uq_token_hash UNIQUE (token_hash),

    -- Проверки данных
    CONSTRAINT chk_token_hash_length CHECK (CHAR_LENGTH(token_hash) >= 64),

    -- Индексы
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_expires (expires_at),
    INDEX idx_sessions_revoked (is_revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Активные пользовательские сессии';
*/