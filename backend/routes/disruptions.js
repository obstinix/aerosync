import { Router } from 'express';
import { db } from '../db/index.js';
import { randomUUID } from 'crypto';
import { authenticate } from '../middleware/auth.js';
import { disruptionLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/simulate', authenticate, disruptionLimiter, async (req, res, next) => {
  try {
    const { type, airport, severity, description } = req.body;
    if (!type || !airport || !severity) {
      return res.status(400).json({ error: 'type, airport, and severity are required' });
    }
    if (severity < 1 || severity > 10) {
      return res.status(400).json({ error: 'severity must be between 1 and 10' });
    }

    // Find flights affected by this airport disruption using Prisma
    const affectedFlights = await db.flight.findMany({
      where: {
        OR: [
          { origin: airport },
          { destination: airport }
        ]
      }
    });

    const delayMinutesAdded = severity * 8; // 8 min per severity point
    const disruptionId = randomUUID();

    // Persist disruption
    await db.disruption.create({
      data: {
        id: disruptionId,
        type,
        airport,
        severity,
        description: description || `${type} event at ${airport}`,
        affectedFlightIds: JSON.stringify(affectedFlights.map(f => f.id)),
        injectedAt: new Date().toISOString(),
      }
    });

    // Update affected flights
    for (const flight of affectedFlights) {
      await db.flight.update({
        where: { id: flight.id },
        data: {
          status: severity >= 7 ? 'critical' : 'delayed',
          delayMinutes: Math.min(flight.delayMinutes + delayMinutesAdded, 240),
          updatedAt: new Date().toISOString(),
        }
      });
    }

    // Create an alert
    const alertId = randomUUID();
    await db.alert.create({
      data: {
        id: alertId,
        severity: severity >= 7 ? 'critical' : 'warning',
        message: `${type.toUpperCase()} disruption at ${airport} — ${affectedFlights.length} flights affected`,
        disruptionId,
        createdAt: new Date().toISOString(),
      }
    });

    // Emit cascade event to all WS clients
    const io = req.app.get('io');
    io?.emit('disruption:cascade', {
      originAirport: airport,
      affectedFlights: affectedFlights.map(f => f.id),
      totalDelay: affectedFlights.length * delayMinutesAdded,
      severity,
    });
    io?.emit('alert:new', {
      severity: severity >= 7 ? 'critical' : 'warning',
      message: `${type} at ${airport}`,
      timestamp: new Date().toISOString(),
    });

    res.json({
      disruptionId,
      affectedCount: affectedFlights.length,
      estimatedTotalDelay: affectedFlights.length * delayMinutesAdded,
    });
  } catch (e) { next(e); }
});

export default router;
