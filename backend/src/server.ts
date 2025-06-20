import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { initDB } from './database';
import { initWebSocket } from './websocket';
import adRequestRouter from './routes/adRequest';
import adminRouter from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
initWebSocket(server);

// Initialize database
initDB().then(() => {
  console.log('Database initialized');
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Routes
app.use('/', adRequestRouter);
app.use('/', adminRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});