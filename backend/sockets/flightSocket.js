import { db } from '../db/index.js';
import { flights } from '../db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Initialize real-time WebSocket flight updates from database.
 * Emits flight:updated every 4 seconds with actual DB state.
 * @param {import('socket.io').Server} io
 */
export function initFlightSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Send full flight state immediately on connect
    db.select().from(flights).all().then(all => {
      socket.emit('flights:init', all);
    });

    // Handle schedule update from drag-drop board
    socket.on('schedule:update', async ({ flightId, newSlot }) => {
      try {
        const [updated] = await db.update(flights)
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
      // Delegate to REST route logic — emit an internal event
      io.emit('disruption:injected', data);
    });

    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  // Poll DB and broadcast changed flights every 4 seconds
  setInterval(async () => {
    try {
      const all = await db.select().from(flights).all();
      // Simulate minor progress updates on in-flight aircraft
      for (const flight of all) {
        if (flight.progressPct < 1 && flight.status !== 'cancelled') {
          const nextProgress = Math.min(1, flight.progressPct + 0.002);
          await db.update(flights)
            .set({ progressPct: nextProgress })
            .where(eq(flights.id, flight.id));
          io.emit('flight:updated', { ...flight, progressPct: nextProgress });
        }
      }
    } catch (e) {
      console.error('[WS] Tick error:', e.message);
    }
  }, 4000);

  // Attach io to app for use in route handlers
  return io;
}
