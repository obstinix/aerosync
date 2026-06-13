import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { sqlite } from './db/index.js';
import flightsRouter from './routes/flights.js';
import cargoRouter from './routes/cargo.js';
import disruptionsRouter from './routes/disruptions.js';
import { initFlightSocket } from './sockets/flightSocket.js';
import { requestLogger } from './middleware/logger.js';

// Run migrations on startup
import('./db/migrate.js');

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'wss:', 'https://opensky-network.org'],
      imgSrc: ["'self'", 'data:', 'https://api.mapbox.com', 'blob:'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Request logger
app.use(requestLogger);

// Rate limiting — applied to mutation routes
const mutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, slow down.' },
});

// Routes
app.use('/api/flights', flightsRouter);
app.use('/api/cargo', cargoRouter);
app.use('/api/disruptions', mutationLimiter, disruptionsRouter);

// Health check — used by Render and monitoring
app.get('/health', (req, res) => {
  try {
    sqlite.prepare('SELECT 1').get();
    res.json({ status: 'ok', db: 'ok', ts: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({ status: 'degraded', db: 'error', error: e.message });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// WebSocket
initFlightSocket(io);

// Store io in app settings so routes can access it
app.set('io', io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT}`);
  console.log(`[SERVER] Health: http://localhost:${PORT}/health`);
});

export { io };
