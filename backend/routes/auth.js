import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aerosync-secret-key-10293';

router.post('/demo-login', (req, res) => {
  const payload = {
    username: 'demo_operator',
    role: 'operator',
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: payload });
});

export default router;
