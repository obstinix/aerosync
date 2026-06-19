import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { db } from './db/index.js';
import flightsRouter from './routes/flights.js';
import cargoRouter from './routes/cargo.js';
import disruptionsRouter from './routes/disruptions.js';
import authRouter from './routes/auth.js';
import { initFlightSocket } from './sockets/flightSocket.js';
import { requestLogger } from './middleware/logger.js';

const app = express();
const httpServer = createServer(app);

// Allowed origins — supports Render production URL and local dev
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'https://aerosync-td50.onrender.com',
  'http://localhost:9000',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'wss:', 'ws:', 'https://opensky-network.org', ...ALLOWED_ORIGINS],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://*.basemaps.cartocdn.com', 'https://api.mapbox.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://unpkg.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS
app.use(cors({
  origin: ALLOWED_ORIGINS,
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
app.use('/api/auth', authRouter);
app.use('/api/flights', flightsRouter);
app.use('/api/cargo', cargoRouter);
app.use('/api/disruptions', mutationLimiter, disruptionsRouter);

// Root route — API discovery
app.get('/', (req, res) => {
  res.json({
    name: 'AeroSync API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: '/health',
      flights: '/api/flights',
      cargo: '/api/cargo',
      disruptions: '/api/disruptions/simulate',
    },
    docs: 'https://github.com/obstinix/aerosync',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend static build in production
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.join(__dirname, '../frontend/dist');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDist));
}

// Health check — used by Render and monitoring
app.get('/health', async (req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'ok', ts: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({ status: 'degraded', db: 'error', error: e.message });
  }
});

// 404 fallback — serve SPA in production, JSON 404 for API routes
app.use((req, res) => {
  if (process.env.NODE_ENV === 'production' && !req.path.startsWith('/api/') && !req.path.startsWith('/health')) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }
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

import { initOpenSkyService } from './services/openskyService.js';
initOpenSkyService(io);

// Store io in app settings so routes can access it
app.set('io', io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT}`);
  console.log(`[SERVER] Health: http://localhost:${PORT}/health`);
});

export { io };
