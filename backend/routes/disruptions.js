import { Router } from 'express';
import { db } from '../db/index.js';
import { disruptions, flights, alerts } from '../db/schema.js';
import { randomUUID } from 'crypto';
import { sql, eq } from 'drizzle-orm';

const router = Router();

router.post('/simulate', async (req, res, next) => {
  try {
    const { type, airport, severity, description } = req.body;
    if (!type || !airport || !severity) {
      return res.status(400).json({ error: 'type, airport, and severity are required' });
    }
    if (severity < 1 || severity > 10) {
      return res.status(400).json({ error: 'severity must be between 1 and 10' });
    }

    // Find flights affected by this airport disruption
    const affectedFlights = await db.select()
      .from(flights)
      .where(sql`${flights.origin} = ${airport} OR ${flights.destination} = ${airport}`)
      .all();

    const delayMinutesAdded = severity * 8; // 8 min per severity point
    const disruptionId = randomUUID();

    // Persist disruption
    await db.insert(disruptions).values({
      id: disruptionId,
      type,
      airport,
      severity,
      description: description || `${type} event at ${airport}`,
      affectedFlightIds: JSON.stringify(affectedFlights.map(f => f.id)),
    });

    // Update affected flights
    for (const flight of affectedFlights) {
      await db.update(flights).set({
        status: severity >= 7 ? 'critical' : 'delayed',
        delayMinutes: Math.min(flight.delayMinutes + delayMinutesAdded, 240),
        updatedAt: new Date().toISOString(),
      }).where(eq(flights.id, flight.id));
    }

    // Create an alert
    const alertId = randomUUID();
    await db.insert(alerts).values({
      id: alertId,
      severity: severity >= 7 ? 'critical' : 'warning',
      message: `${type.toUpperCase()} disruption at ${airport} — ${affectedFlights.length} flights affected`,
      disruptionId,
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
