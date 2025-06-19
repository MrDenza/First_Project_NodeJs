const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { TOKEN_SECRET, ACCESS_EXP_TOKEN, REFRESH_EXP_TOKEN, HASH_SECRET } = process.env;

module.exports = {
    // Генерация JWT токена доступа
    generateAccessTokenAsync(userId) {
        return new Promise((resolve, reject) => {
            jwt.sign(
                { userId },
                TOKEN_SECRET,
                { expiresIn: ACCESS_EXP_TOKEN },
                (err, token) => {
                    if (err) return reject(err);
                    resolve(token);
                }
            );
        });
    },


    // Генерация refresh token
    generateRefreshTokenAsync() {
        return new Promise((resolve, reject) => {
            jwt.sign(
                { type: 'refresh' },
                TOKEN_SECRET,
                { expiresIn: REFRESH_EXP_TOKEN },
                (err, token) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(token);
                }
            );
        });
    },

    //Хеширование токена
    hashToken(token) {
        return crypto.createHmac('sha256', HASH_SECRET).update(token).digest('hex');
    },

    // Верификация токена
    verifyTokenAsync(token, option = {}) {
        return new Promise((resolve) => {
            jwt.verify(token, TOKEN_SECRET, option, (err, decoded) => {
                if (err) return resolve(null);
                resolve(decoded);
            });
        });
    },

    // Извлечение payload без проверки подписи
    decodeToken(token) {
        try {
            return jwt.decode(token);
        } catch (e) {
            return null;
        }
    },

    // Просрочка валидного токена
    async isTokenFreshAsync(token, thresholdPercentage = 20) {
        const decoded = await this.verifyTokenAsync(token);
        if (!decoded) return false;

        const now = Math.floor(Date.now() / 1000);
        const lifetime = decoded.exp - decoded.iat;
        const threshold = lifetime * (thresholdPercentage / 100);

        return (decoded.exp - now) > threshold;
    },
}