import { Router } from 'express';
import { db } from '../db/index.js';
import { cargo } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/cargo
router.get('/', async (req, res, next) => {
  try {
    const all = await db.select().from(cargo).all();
    res.json({ cargo: all, count: all.length });
  } catch (e) { next(e); }
});

// GET /api/cargo/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [item] = await db.select().from(cargo).where(eq(cargo.id, req.params.id));
    if (!item) return res.status(404).json({ error: 'Cargo manifest not found' });
    res.json(item);
  } catch (e) { next(e); }
});

export default router;
