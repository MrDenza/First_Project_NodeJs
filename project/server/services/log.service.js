const fs = require("fs/promises");
const os = require("os");

exports.logLineAsync = async (logFilePath, logLine) => {
    const now = new Date();
    const line = `${now.toLocaleDateString()} ${now.toLocaleTimeString()} ${logLine}`;

    console.log(line);

    try {
        await fs.appendFile(logFilePath, line + os.EOL, 'utf8');
    } catch (err) {
        console.error('Ошибка логирования:', err);
    }
};