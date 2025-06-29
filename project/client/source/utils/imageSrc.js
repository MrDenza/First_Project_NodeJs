const STATIC_SERVER = import.meta.env.VITE_STATIC_SERVER || '';

export function getImageSrc(path) {
    if (!path) return '';

    const isAbsolute = /^(https?:)?\/\//i.test(path) || path.startsWith('blob:');

    if (isAbsolute) {
        return path;
    } else {
        // Относительный путь — добавляем STATIC_SERVER для Vite
        return STATIC_SERVER.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
    }
}
