import { rateLimit } from 'express-rate-limit';

export const disruptionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: { error: 'Too many disruption simulations, limit is 5 per minute' },
  standardHeaders: true,
  legacyHeaders: false,
});
