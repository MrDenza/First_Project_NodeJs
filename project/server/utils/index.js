const path = require("path");
const fs = require("fs/promises");
const { POSTS_UPLOAD_DIR } = require("../config/paths.config");
const logger = require("./logger");

exports.getDecodedHeader = (headers, name, defVal = '') => {
    let val = headers[name];
    if (Array.isArray(val)) val = val[0];
    if (typeof val === 'string' && val) {
        try {
            return decodeURIComponent(val);
        } catch {
            return val; // если decodeURIComponent упадёт, вернём исходное значение
        }
    }
    return defVal;
};

exports.deletePostFiles = async(postId, images) => {
    try {
        // Удаляем файлы изображений
        const fileDeletionPromises = images.map(async(image) => {
            if (image.file_path) {
                try {
                    await fs.rm(image.file_path, { force: true });
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        logger.error(error, `DeletePostFiles | Ошибка удаления файла: ${image.file_path}`);
                    }
                }
            }
        });

        await Promise.all(fileDeletionPromises);

        // Удаляем папку поста рекурсивно
        const postDir = path.join(POSTS_UPLOAD_DIR, String(postId));
        try {
            await fs.rm(postDir, {
                recursive: true,
                force: true
            });
        } catch (error) {
            if (error.code !== 'ENOENT') {
                logger.error(error, `DeletePostFiles | Ошибка удаления файла: Ошибка удаления директории: ${postDir}`);
            }
        }

        return true;
    } catch (error) {
        logger.error(error, `DeletePostFiles | Ошибка удаления файлов поста`);
        return false;
    }
}

exports.getUniqueFileName = async (dir, name) => {
    const ext = path.extname(name);
    const base = path.basename(name, ext);
    let i = 0, fileName, fullPath;
    do {
        fileName = i === 0 ? name : `${base}(${i})${ext}`;
        fullPath = path.join(dir, fileName);
        i++;
    } while (await fileExists(fullPath));
    return fileName;
};

exports.getFileExtension = async (mimeType) => {
    const extensions = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg'
    };

    return extensions[mimeType] || 'bin';
};

const fileExists = async path => {
    try { await fs.access(path); return true; } catch { return false; }
};

exports.generateUserId = () => "user_" + (Date.now() + Math.floor(Math.random() * 10000)).toString(36);