/*
const WebSocket = require("ws");
const { wsClients } = require("../services/ws.service");
const { logLineAsync } = require("../services/log.service");
const { LOG_FILE } = require("../config/paths.config");

exports.initWebSocketServer = server => {
    const wss = new WebSocket.Server({ server });
    wss.on('connection', (ws, req) => {
        ws.isAlive = true;

        ws.on('pong', () => ws.isAlive = true);

        ws.on('message', message => {
            try {
                const dataStr = typeof message === 'string' ? message : message.toString();
                const data = JSON.parse(dataStr);
                if (data.type === 'register' && data.uid) {
                    ws.uid = data.uid;
                    wsClients.set(data.uid, ws);
                    logLineAsync(LOG_FILE, `[${req.socket.remoteAddress}]-[WS] - Новое соединение! UID: ${ws.uid}`).catch(console.error);
                }
            } catch (e) {
                console.error("WS сообщение не распознано:", e);
            }
        });

        ws.on('close', () => {
            if (ws.uid) {
                wsClients.delete(ws.uid);
                logLineAsync(LOG_FILE, `[${req.socket.remoteAddress}]-[WS] - Соединение закрыто! UID: ${ws.uid}`).catch(console.error);
            }
        });

        ws.on('error', (err) => console.error('Ошибка WebSocket:', err));
    });

    setInterval(() => {
        logLineAsync(LOG_FILE, `[WS][AUTO-CLEANER] - Автоматическая проверка доступности клиентов и очистка...`).catch(console.error);
        // Проверяем все WebSocket-соединения
        wss.clients.forEach(ws => {
            if (!ws.isAlive) {
                logLineAsync(LOG_FILE, `[WS][AUTO-CLEANER] - Закрываем неактивное соединение: ${ws.uid}`).catch(console.error);
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        });
        // Очищаем wsClients от закрытых соединений
        for (const [uid, ws] of wsClients.entries()) {
            if (ws.readyState !== WebSocket.OPEN) {
                logLineAsync(LOG_FILE, `[WS][AUTO-CLEANER] - Удаляем неактивного клиента из списка wsClients: ${ws.uid}`).catch();
                wsClients.delete(uid);
            }
        }
    }, 5 * 60 * 1000);
};*/
