//const cors = require('cors');
//const rateLimit = require('express-rate-limit');
const express = require("express");
const http = require("http");
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { STATIC_FILES_DIR, STATIC_UPLOAD_DIR } = require("./config/paths.config");
const PORT = process.env.PORT || require("./config/server.config").PORT;
const { initEmailService } = require('./services/email.service');
const errorHandler = require('./middlewares/errorHandler.middleware');
const { authenticate } = require("./database/database");
const logger = require("./utils/logger");

const app = express();
const server = http.createServer(app);
const routesMap = require("./routes");

app.use((req, res, next) => {
    if (req.url.startsWith('/.well-known')) return res.status(404).end();
    next();
});
app.use(express.static(STATIC_FILES_DIR, { index: false }));
app.use(express.static(STATIC_UPLOAD_DIR, { index: false }));
app.use(cookieParser());
app.use(express.json());
app.use(routesMap);
//app.use(cors());

app.use(errorHandler); // всегда последний!

authenticate()
.then(async () => {
    try {
        await initEmailService();
        server.listen(PORT, () => {
            logger.info(`SERVER | Сервер запущен на порту ${PORT}`);
            console.log(`SERVER | Сервер запущен на порту ${PORT}`);
        });
    } catch (error) {
        logger.error(error, `SERVER | Ошибка инициализации сервисов`);
        process.exit(1);
    }
})
.catch(() => {
    logger.error(`SERVER | Ошибка запуска сервера`);
    process.exit(1);
});