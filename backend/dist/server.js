"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./database");
const websocket_1 = require("./websocket");
const adRequest_1 = __importDefault(require("./routes/adRequest"));
const admin_1 = __importDefault(require("./routes/admin"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize WebSocket
(0, websocket_1.initWebSocket)(server);
// Initialize database
(0, database_1.initDB)().then(() => {
    console.log('Database initialized');
}).catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
// Routes
app.use('/', adRequest_1.default);
app.use('/', admin_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server is ready`);
});
//# sourceMappingURL=server.js.map