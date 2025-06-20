import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { WebSocketMessage } from './types';

let wss: WebSocketServer;
const clients = new Set<WebSocket>();

export function initWebSocket(server: Server): void {
  wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws: WebSocket) => {
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

export function broadcast(message: WebSocketMessage): void {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}