import { db } from './index.js';
import { flights, cargo } from './schema.js';

const SEED_FLIGHTS = [
  { id: 'AE-204', flightNumber: 'AE204', origin: 'JFK', destination: 'LHR', status: 'delayed',
    scheduledDeparture: '2026-01-01T14:30:00Z', estimatedDeparture: '2026-01-01T15:47:00Z',
    gate: 'B22', aircraftType: 'B777', cargoWeightKg: 18500, delayMinutes: 77, progressPct: 0.32 },
  { id: 'AE-117', flightNumber: 'AE117', origin: 'JFK', destination: 'CDG', status: 'on-time',
    scheduledDeparture: '2026-01-01T15:00:00Z', estimatedDeparture: '2026-01-01T15:00:00Z',
    gate: 'C14', aircraftType: 'A380', cargoWeightKg: 22000, delayMinutes: 0, progressPct: 0.61 },
  { id: 'AE-339', flightNumber: 'AE339', origin: 'JFK', destination: 'NRT', status: 'on-time',
    scheduledDeparture: '2026-01-01T13:45:00Z', estimatedDeparture: '2026-01-01T13:45:00Z',
    gate: 'A07', aircraftType: 'B787', cargoWeightKg: 15200, delayMinutes: 0, progressPct: 0.88 },
  { id: 'AE-501', flightNumber: 'AE501', origin: 'EWR', destination: 'ORD', status: 'delayed',
    scheduledDeparture: '2026-01-01T16:00:00Z', estimatedDeparture: '2026-01-01T16:32:00Z',
    gate: 'D03', aircraftType: 'A321', cargoWeightKg: 8400, delayMinutes: 32, progressPct: 0.21 },
  { id: 'AE-780', flightNumber: 'AE780', origin: 'JFK', destination: 'DXB', status: 'critical',
    scheduledDeparture: '2026-01-01T18:00:00Z', estimatedDeparture: '2026-01-01T19:14:00Z',
    gate: 'B31', aircraftType: 'A350', cargoWeightKg: 28000, delayMinutes: 74, progressPct: 0.04 },
];

const SEED_CARGO = [
  { id: 'CG-001', flightId: 'AE-204', manifestNumber: 'MNF-9921', weightKg: 18500, capacityKg: 20000, status: 'loaded', hazmat: 0, priority: 'express' },
  { id: 'CG-002', flightId: 'AE-117', manifestNumber: 'MNF-8402', weightKg: 22000, capacityKg: 30000, status: 'loaded', hazmat: 1, priority: 'priority' },
  { id: 'CG-003', flightId: 'AE-339', manifestNumber: 'MNF-1029', weightKg: 15200, capacityKg: 18000, status: 'loaded', hazmat: 0, priority: 'standard' },
  { id: 'CG-004', flightId: 'AE-501', manifestNumber: 'MNF-4402', weightKg: 8400, capacityKg: 10000, status: 'loaded', hazmat: 0, priority: 'priority' },
  { id: 'CG-005', flightId: 'AE-780', manifestNumber: 'MNF-0019', weightKg: 28000, capacityKg: 30000, status: 'overweight', hazmat: 1, priority: 'express' },
];

await db.insert(flights).values(SEED_FLIGHTS).onConflictDoNothing();
await db.insert(cargo).values(SEED_CARGO).onConflictDoNothing();

console.log('[SEED] Flights and Cargo inserted.');
