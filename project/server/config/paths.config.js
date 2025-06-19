const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../../");
const CLIENT_DIR = path.join(ROOT_DIR, "client");
const PUBLIC_DIR = path.join(CLIENT_DIR, "public");

module.exports = {
    ROOT_DIR,
    CLIENT_DIR,
    PUBLIC_DIR,

    INDEX_HTML: path.join(PUBLIC_DIR, "index.html"),
    LOG_FILE: path.join(ROOT_DIR, "_server.log"),
    SSR_CLIENT_FILE: path.join(PUBLIC_DIR, "ssr/ssr-entry-server.js"),
    STATIC_FILES_DIR: PUBLIC_DIR,
};