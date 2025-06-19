const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: {
                name: 'users_username_unique',
                msg: 'Это имя пользователя уже занято'
            },
            validate: {
                len: {
                    args: [3, 50],
                    msg: 'Имя пользователя должно быть от 3 до 50 символов'
                },
                is: {
                    args: /^[a-zA-Z0-9_]+$/,
                    msg: 'Только буквы, цифры и подчёркивания'
                }
            }
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: {
                name: 'users_email_unique',
                msg: 'Этот email уже зарегистрирован'
            },
            validate: {
                isEmail: {
                    msg: 'Некорректный email'
                },
                notEmpty: true
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        last_online: {
            type: DataTypes.DATE,
            defaultValue: null
        }
    }, {
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: 'idx_user_active',
                fields: ['is_active']
            },
            {
                name: 'idx_user_email',
                fields: ['email']
            },
            {
                name: 'idx_user_username',
                fields: ['username']
            }
        ],
        hooks: {
            beforeValidate: (user) => {
                if (user.email) {
                    user.email = user.email.toLowerCase().trim();
                }
                if (user.username) {
                    user.username = user.username.trim();
                }
            }
        }
    });

    User.associate = (models) => {
        User.hasOne(models.UserActivationToken, {
            foreignKey: 'user_id',
            as: 'user_activation_token',
            onDelete: 'CASCADE'
        });

        User.hasMany(models.Session, {
            foreignKey: 'user_id',
            as: 'sessions',
            onDelete: 'CASCADE'
        });
    };

    // Методы экземпляра
    User.prototype.updateLastOnline = async function() {
        this.last_online = new Date();
        return this.save();
    };

    User.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());
        delete values.password_hash;
        return values;
    };

    return User;
};

/*
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    last_online TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Уникальные ограничения
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email UNIQUE (email),

    -- Проверки формата данных
    CONSTRAINT chk_username_format CHECK (username REGEXP '^[a-zA-Z0-9_]+$'),
    CONSTRAINT chk_username_length CHECK (CHAR_LENGTH(username) BETWEEN 3 AND 50),
    CONSTRAINT chk_email_format CHECK (email LIKE '%_@__%.__%'),
    CONSTRAINT chk_password_hash_length CHECK (CHAR_LENGTH(password_hash) >= 60),

    -- Индексы
    INDEX idx_users_active (is_active),
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Пользователи системы';
*/