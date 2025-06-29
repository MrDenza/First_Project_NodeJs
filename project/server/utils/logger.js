const pino = require('pino');
const { resolve } = require("node:path");
const PORT = process.env.PORT || require("../config/server.config").PORT;
const transport = pino.transport({
    targets: [
        { target: 'pino/file', options: { destination: resolve(__dirname, `../../_server_${PORT}.log`) } }
    ]
});
const logger = pino({}, transport);
module.exports = logger;

// logger.fatal('fatal');
// logger.error('error');
// logger.warn('warn');
// logger.info('info');
// logger.debug('debug');
// logger.trace('trace');
