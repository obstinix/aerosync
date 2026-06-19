import { db } from '../db/index.js';

/**
 * Initialize real-time WebSocket flight updates from database.
 * Emits flight:updated every 4 seconds with actual DB state.
 *
 * @param {import('socket.io').Server} io
 */
export function initFlightSocket(io) {
  io.on('connection', async (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Join default room
    socket.join('hub:ALL');

    // Send full flight state immediately on connect
    try {
      const all = await db.flight.findMany();
      socket.emit('flights:init', all);
    } catch (e) {
      console.error('[WS] flights:init error', e.message);
    }

    // Join specific hub room
    socket.on('hub:join', (hub) => {
      // Leave other hub rooms
      for (const room of socket.rooms) {
        if (room.startsWith('hub:') && room !== `hub:${hub}`) {
          socket.leave(room);
        }
      }
      socket.join(`hub:${hub}`);
      console.log(`[WS] Client ${socket.id} joined room hub:${hub}`);
    });

    // Handle schedule update from drag-drop board
    socket.on('schedule:update', async ({ flightId, newSlot }) => {
      try {
        const updated = await db.flight.update({
          where: { id: flightId },
          data: { estimatedDeparture: newSlot, updatedAt: new Date().toISOString() }
        });
        
        // Scope broadcast to specific hub rooms + ALL
        io.to(`hub:${updated.origin}`)
          .to(`hub:${updated.destination}`)
          .to('hub:ALL')
          .emit('flight:updated', updated);
      } catch (e) {
        console.error('[WS] schedule:update error', e);
        socket.emit('error', { message: 'Failed to update schedule' });
      }
    });

    // Handle disruption injection from simulator panel
    socket.on('disruption:inject', (data) => {
      io.to('hub:ALL').emit('disruption:injected', data);
    });

    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  // Poll DB and broadcast changed flights every 4 seconds
  setInterval(async () => {
    try {
      const all = await db.flight.findMany();
      for (const flight of all) {
        if (flight.progressPct < 1 && flight.status !== 'cancelled') {
          const nextProgress = Math.min(1.0, flight.progressPct + 0.002);
          const updated = await db.flight.update({
            where: { id: flight.id },
            data: { progressPct: nextProgress }
          });
          
          // Scope broadcast to specific hub rooms + ALL
          io.to(`hub:${updated.origin}`)
            .to(`hub:${updated.destination}`)
            .to('hub:ALL')
            .emit('flight:updated', updated);
        }
      }
    } catch (e) {
      console.error('[WS] Tick error:', e.message);
    }
  }, 4000);

  return io;
}
