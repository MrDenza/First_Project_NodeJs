module.exports = (sequelize) => {
    const models = {
        User: require('./user.model')(sequelize),
        UserActivationToken: require('./userActivationToken.model')(sequelize),
        Session: require('./session.model')(sequelize)
    };

    Object.values(models).forEach(model => {
        if (model.associate) {
            model.associate(models);
        }
    });

    const repositories = {
        User: require('../repositories/user.repository')(models),
        UserActivationToken: require('../repositories/userActivationToken.repository')(models),
        Session: require('../repositories/session.repository')(models)
    };

    return {
        models,
        repositories,
    };
};