const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../../");
const CLIENT_DIR = path.join(ROOT_DIR, "client");
const PUBLIC_DIR = path.join(CLIENT_DIR, "public");
const UPLOAD_DIR = path.join(ROOT_DIR, "upload");

module.exports = {
    ROOT_DIR,
    CLIENT_DIR,
    PUBLIC_DIR,
    UPLOAD_DIR,

    INDEX_HTML: path.join(PUBLIC_DIR, "index.html"),
    LOG_FILE: path.join(ROOT_DIR, "_server.log"),
    SSR_CLIENT_FILE: path.join(PUBLIC_DIR, "ssr/ssr-entry-server.js"),
    STATIC_FILES_DIR: PUBLIC_DIR,
    POSTS_UPLOAD_DIR: path.join(UPLOAD_DIR, "user_posts"),
    STATIC_UPLOAD_DIR: UPLOAD_DIR,
};