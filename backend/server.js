const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const flightRoutes = require('./routes/flights');
const setupSockets = require('./sockets/flightSocket');
const logger = require('./middleware/logger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/api/flights', flightRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'aerosync-backend' });
});

setupSockets(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[AeroSync] Backend running on port ${PORT}`);
  console.log(`[AeroSync] WebSocket ready`);
});
