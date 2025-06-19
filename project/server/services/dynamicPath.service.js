const path = require("path");
const { UPLOADS_DIR, USER_LIST_DIR } = require("../config/paths.config");

const getUserUploadDir = (uid) => {
    if (uid) return path.join(UPLOADS_DIR, uid);
};

const getUserFilesList = (uid) => {
    if (uid) return path.join(USER_LIST_DIR, `${uid}.json`);
};

const getUploadedFilePath = (uid, fileName) => {
    if (uid && fileName) return path.join(UPLOADS_DIR, uid, fileName);
};

const getPathToFile = (dir, fileName) => {
    if (dir && fileName) return path.join(dir, fileName);
};

module.exports = {
    getUserUploadDir,
    getUserFilesList,
    getUploadedFilePath,
    getPathToFile,
};