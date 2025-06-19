// const { logLineAsync } = require("../services/log.service");
// const { LOG_FILE } = require("../config/paths.config");

module.exports = async function errorHandler(err, req, res, next) {
    const statusCode = err.status || 500;
    const errorMsg = err.message || "Internal Server Error";

    //await logLineAsync(LOG_FILE, `[${req.ip}]-[${req.method}] ${req.originalUrl} - ${errorMsg}`);

    // Защита от повторной отправки ответа
    if (res.headersSent) return next(err);

    res.status(statusCode).json({ status: "error", error: errorMsg });
};