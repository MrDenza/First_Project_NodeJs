function getAssociationType(association) {
    switch (association.associationType) {
        case 'BelongsTo': return 'BelongsTo';
        case 'HasOne': return 'HasOne';
        case 'HasMany': return 'HasMany';
        case 'BelongsToMany': return 'BelongsToMany';
        default: return association.associationType;
    }
}

module.exports = function logModelAssociations(models, options = {}) {
    const { detailed = false, colors = true } = options;

    const colorReset = colors ? '\x1b[0m' : '';
    const colorModel = colors ? '\x1b[36m' : '';
    const colorAssoc = colors ? '\x1b[33m' : '';
    const colorType = colors ? '\x1b[32m' : '';
    const colorOption = colors ? '\x1b[35m' : '';

    console.log('=== МОДЕЛИ И АССОЦИАЦИИ ===');

    Object.entries(models).forEach(([modelName, model]) => {
        console.log(`${colorModel}${modelName}${colorReset}:`);

        if (!model.associations || Object.keys(model.associations).length === 0) {
            console.log('  нет ассоциаций');
        } else {
            Object.entries(model.associations).forEach(([assocName, association]) => {
                const targetModel = association.target.name;
                const assocType = getAssociationType(association);

                console.log(`  ${colorAssoc}${assocName}${colorReset}: ${colorType}${assocType}${colorReset} → ${colorModel}${targetModel}${colorReset}`);

                if (detailed) {
                    console.log(`    Внешний ключ: ${colorOption}${association.foreignKey || 'по умолчанию'}${colorReset}`);
                }
            });
        }
    });
    console.log('=======================\n');
};