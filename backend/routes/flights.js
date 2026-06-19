import { Router } from 'express';
import { db } from '../db/index.js';
import { validateFlightPatch } from '../validators/flight.js';

const router = Router();

// GET /api/flights
router.get('/', async (req, res, next) => {
  try {
    const all = await db.flight.findMany();
    res.json({ flights: all, count: all.length });
  } catch (e) { next(e); }
});

// GET /api/flights/:id
router.get('/:id', async (req, res, next) => {
  try {
    const flight = await db.flight.findUnique({ where: { id: req.params.id } });
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
    
    // Check if flight exists first
    const exists = await db.flight.findUnique({ where: { id: req.params.id } });
    if (!exists) return res.status(404).json({ error: 'Flight not found' });

    const updated = await db.flight.update({
      where: { id: req.params.id },
      data: { ...parsed.data, updatedAt: new Date().toISOString() },
    });
    
    // Broadcast to all WS clients
    req.app.get('io')?.emit('flight:updated', updated);
    res.json(updated);
  } catch (e) { next(e); }
});

// POST /api/flights/:id/predictions
router.post('/:id/predictions', async (req, res, next) => {
  try {
    const { delayProbability, estimatedDelayMinutes, confidence, reason, modelVersion } = req.body;
    
    // Verify flight exists
    const exists = await db.flight.findUnique({ where: { id: req.params.id } });
    if (!exists) return res.status(404).json({ error: 'Flight not found' });

    const prediction = await db.delayPrediction.create({
      data: {
        flightId: req.params.id,
        delayProbability: Number(delayProbability || 0),
        estimatedDelayMinutes: Number(estimatedDelayMinutes || 0),
        confidence: Number(confidence || 0),
        reason: reason || '',
        modelVersion: modelVersion || '',
        createdAt: new Date().toISOString(),
      }
    });
    res.json(prediction);
  } catch (e) { next(e); }
});

export default router;
