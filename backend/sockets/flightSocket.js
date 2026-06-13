import { db } from '../db/index.js';
import { flights } from '../db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Initialize real-time WebSocket flight updates from database.
 * Emits flight:updated every 4 seconds with actual DB state.
 *
 * NOTE: better-sqlite3 + drizzle is synchronous — no await/.then needed on queries.
 *
 * @param {import('socket.io').Server} io
 */
export function initFlightSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Send full flight state immediately on connect (synchronous)
    try {
      const all = db.select().from(flights).all();
      socket.emit('flights:init', all);
    } catch (e) {
      console.error('[WS] flights:init error', e.message);
    }

    // Handle schedule update from drag-drop board
    socket.on('schedule:update', ({ flightId, newSlot }) => {
      try {
        const [updated] = db.update(flights)
          .set({ estimatedDeparture: newSlot, updatedAt: new Date().toISOString() })
          .where(eq(flights.id, flightId))
          .returning();
        io.emit('flight:updated', updated);
      } catch (e) {
        console.error('[WS] schedule:update error', e);
        socket.emit('error', { message: 'Failed to update schedule' });
      }
    });

    // Handle disruption injection from simulator panel
    socket.on('disruption:inject', (data) => {
      io.emit('disruption:injected', data);
    });

    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  // Poll DB and broadcast changed flights every 4 seconds
  setInterval(() => {
    try {
      const all = db.select().from(flights).all();
      for (const flight of all) {
        if (flight.progressPct < 1 && flight.status !== 'cancelled') {
          const nextProgress = Math.min(1, flight.progressPct + 0.002);
          db.update(flights)
            .set({ progressPct: nextProgress })
            .where(eq(flights.id, flight.id))
            .run();
          io.emit('flight:updated', { ...flight, progressPct: nextProgress });
        }
      }
    } catch (e) {
      console.error('[WS] Tick error:', e.message);
    }
  }, 4000);

  return io;
}
