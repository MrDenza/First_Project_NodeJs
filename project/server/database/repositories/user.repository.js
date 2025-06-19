const { Op } = require('sequelize');

module.exports = (models) => ({
    // Создание пользователя
    async createUser(userData, transaction = null) {
        return models.User.create(userData, { transaction });
    },

    // Находит пользователя по ID
    async findById(userId) {
        return models.User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] },
            include: [{
                association: 'sessions',
                attributes: ['id', 'ip_address', 'created_at']
            }]
        });
    },

    // Поиск по учетным данным
    async findByCredentials(username, email) {
        return models.User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email: email.toLowerCase() }
                ]
            }
        });
    },

    // Активация аккаунта
    async activate(userId, transaction = null) {
        const [affectedCount] = await models.User.update(
            { is_active: true },
            { where: { id: userId }, transaction }
        );
        return affectedCount > 0;
    },

    // Обновление времени последней активности
    // async updateLastOnline(userId) {
    //     await models.User.update(
    //         { last_online: new Date() },
    //         { where: { id: userId } }
    //     );
    // }
});