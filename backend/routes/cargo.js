import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// GET /api/cargo
router.get('/', async (req, res, next) => {
  try {
    const all = await db.cargoShipment.findMany();
    res.json({ cargo: all, count: all.length });
  } catch (e) { next(e); }
});

// GET /api/cargo/:id
router.get('/:id', async (req, res, next) => {
  try {
    const item = await db.cargoShipment.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Cargo manifest not found' });
    res.json(item);
  } catch (e) { next(e); }
});

export default router;
