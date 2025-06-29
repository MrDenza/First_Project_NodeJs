module.exports = (sequelize) => {
    const models = {
        User: require('./user.model')(sequelize),
        UserActivationToken: require('./userActivationToken.model')(sequelize),
        Session: require('./session.model')(sequelize),
        Post: require('./post.model')(sequelize),
        PostBlock: require('./postBlock.model')(sequelize),
        PostImage: require('./postImage.model')(sequelize),
        UserFavorite: require('./userFavorite.model')(sequelize)
    };

    Object.values(models).forEach(model => {
        if (model.associate) {
            model.associate(models);
        }
    });

    const repositories = {
        User: require('../repositories/user.repository')(models),
        UserActivationToken: require('../repositories/userActivationToken.repository')(models),
        Session: require('../repositories/session.repository')(models),
        Post: require('../repositories/post.repository')(models, sequelize),
        PostBlock: require('../repositories/postBlock.repository')(models),
        PostImage: require('../repositories/postImage.repository')(models),
        UserFavorite: require('../repositories/userFavorite.repository')(models)
    };

    return {
        models,
        repositories,
    };
};