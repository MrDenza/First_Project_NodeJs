export const deepMerge = (target, source) => {
    if (typeof target !== 'object' || typeof source !== 'object') {
        return source || target;
    }

    const result = { ...target };

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && !Array.isArray(source[key]) &&
                typeof target[key] === 'object' && !Array.isArray(target[key])) {
                result[key] = deepMerge(target[key], source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }

    return result;
};