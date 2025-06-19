const path = require("path");
const fs = require("fs/promises");

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

const fileExists = async path => {
    try { await fs.access(path); return true; } catch { return false; }
};

exports.generateUserId = () => "user_" + (Date.now() + Math.floor(Math.random() * 10000)).toString(36);