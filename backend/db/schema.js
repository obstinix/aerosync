import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const flights = sqliteTable('flights', {
  id: text('id').primaryKey(),                         // e.g. "AE-204"
  flightNumber: text('flight_number').notNull(),
  origin: text('origin').notNull(),                    // IATA code
  destination: text('destination').notNull(),          // IATA code
  status: text('status').default('scheduled'),         // scheduled|on-time|delayed|cancelled|diverted
  scheduledDeparture: text('scheduled_departure'),     // ISO 8601 string
  estimatedDeparture: text('estimated_departure'),
  scheduledArrival: text('scheduled_arrival'),
  estimatedArrival: text('estimated_arrival'),
  gate: text('gate'),
  aircraftType: text('aircraft_type'),
  cargoWeightKg: real('cargo_weight_kg').default(0),
  delayMinutes: integer('delay_minutes').default(0),
  progressPct: real('progress_pct').default(0),        // 0.0–1.0 flight completion
  lat: real('lat'),
  lon: real('lon'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

export const cargo = sqliteTable('cargo', {
  id: text('id').primaryKey(),
  flightId: text('flight_id').references(() => flights.id),
  manifestNumber: text('manifest_number').notNull(),
  weightKg: real('weight_kg').notNull(),
  capacityKg: real('capacity_kg').notNull(),
  status: text('status').default('loaded'),            // loaded|offloaded|damaged|overweight
  hazmat: integer('hazmat').default(0),                // boolean 0|1
  priority: text('priority').default('standard'),      // standard|priority|express
  updatedAt: text('updated_at').default(new Date().toISOString()),
});

export const disruptions = sqliteTable('disruptions', {
  id: text('id').primaryKey(),                         // uuid
  type: text('type').notNull(),                        // weather|technical|security|atc|medical
  airport: text('airport').notNull(),
  severity: integer('severity').notNull(),             // 1–10
  description: text('description'),
  affectedFlightIds: text('affected_flight_ids'),      // JSON array stringified
  injectedAt: text('injected_at').default(new Date().toISOString()),
  resolvedAt: text('resolved_at'),
});

export const alerts = sqliteTable('alerts', {
  id: text('id').primaryKey(),
  severity: text('severity').notNull(),                // critical|warning|info
  message: text('message').notNull(),
  flightId: text('flight_id'),
  disruptionId: text('disruption_id'),
  acknowledged: integer('acknowledged').default(0),
  createdAt: text('created_at').default(new Date().toISOString()),
});
