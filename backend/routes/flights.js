import { Router } from 'express';
import { db } from '../db/index.js';
import { flights } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { validateFlightPatch } from '../validators/flight.js';

const router = Router();

// GET /api/flights
router.get('/', async (req, res, next) => {
  try {
    const all = await db.select().from(flights).all();
    res.json({ flights: all, count: all.length });
  } catch (e) { next(e); }
});

// GET /api/flights/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [flight] = await db.select().from(flights).where(eq(flights.id, req.params.id));
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    res.json(flight);
  } catch (e) { next(e); }
});

// PATCH /api/flights/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const parsed = validateFlightPatch(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error });
    }
    const [updated] = await db
      .update(flights)
      .set({ ...parsed.data, updatedAt: new Date().toISOString() })
      .where(eq(flights.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: 'Flight not found' });
    // Broadcast to all WS clients
    req.app.get('io')?.emit('flight:updated', updated);
    res.json(updated);
  } catch (e) { next(e); }
});

export default router;
