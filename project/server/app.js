//const compression = require('compression');
//app.use(compression());
//const cors = require('cors');
//const rateLimit = require('express-rate-limit');
const express = require("express");
const http = require("http");
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { STATIC_FILES_DIR } = require("./config/paths.config");
const { PORT } = require("./config/server.config");
const { initEmailService } = require('./services/email.service');
//const { initWebSocketServer } = require("./ws/websocket.server");
//const { logLineAsync } = require("./services/log.service");
const errorHandler = require('./middleware/errorHandler.middleware');
const { authenticate } = require("./database/database");

const app = express();
const server = http.createServer(app);
const routesMap = require("./routes");

app.use((req, res, next) => {
    if (req.url.startsWith('/.well-known')) return res.status(404).end();
    next();
});
app.use(express.static(STATIC_FILES_DIR, { index: false }));
app.use(cookieParser());
app.use(express.json());
app.use(routesMap);
//app.use(cors());
// app.use(async (req, res) => {
//     await logLineAsync(LOG_FILE, `[${req.ip}]-[ERROR] - Обращение к ${req.originalUrl} методом ${req.method}`);
//     res.status(404).json({ status: 'error', error: 'Ресурсы отсутствует.' });
// });
app.use(errorHandler); // всегда последний!

authenticate()
.then(async () => {
    try {
        await initEmailService();
        //initWebSocketServer(server);
        server.listen(PORT, () => console.log(`[SERVER-INFO] Сервер запущен на порту ${PORT}`));
    } catch (error) {
        console.error('Ошибка инициализации сервисов:', error);
        process.exit(1);
    }
})
.catch(() => {
    process.exit(1);
});