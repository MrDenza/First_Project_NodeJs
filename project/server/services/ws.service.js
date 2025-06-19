// const WebSocket = require("ws");
// const wsClients = new Map();
//
// exports.sendWsMessage = (uid, msg) => {
//     const ws = wsClients.get(uid);
//     if (ws?.readyState === WebSocket.OPEN) {
//         ws.send(JSON.stringify(msg));
//     }
// };
//
// exports.sendUploadProgress = (uid, progress) => exports.sendWsMessage(uid, { type: 'uploadProgress', progress });
// exports.sendEndUpload = (uid, close = false) => close && exports.sendWsMessage(uid, { type: 'endUpload' });
// exports.wsClients = wsClients;