"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocket = initWebSocket;
exports.broadcast = broadcast;
const ws_1 = require("ws");
let wss;
const clients = new Set();
function initWebSocket(server) {
    wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');
        clients.add(ws);
        ws.on('close', () => {
            console.log('WebSocket connection closed');
            clients.delete(ws);
        });
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            clients.delete(ws);
        });
    });
}
function broadcast(message) {
    const data = JSON.stringify(message);
    clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(data);
        }
    });
}
//# sourceMappingURL=websocket.js.map