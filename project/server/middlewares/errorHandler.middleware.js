const logger = require("../utils/logger");
module.exports = async function errorHandler(err, req, res, next) {
    const statusCode = err.status || 500;
    const errorMsg = err.message || "Internal Server Error";

    // Защита от повторной отправки ответа
    if (res.headersSent) return next(err);

    logger.error(errorMsg, `GLOBAL_ERROR`);

    res.status(statusCode).json({ status: "error", error: errorMsg });
};