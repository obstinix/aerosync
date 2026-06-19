import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_FLIGHTS = [
  { id:'AI-101', flightNumber:'AIC101', origin:'DEL', destination:'BOM', status:'on-time',
    scheduledDeparture: '2026-01-01T14:30:00Z', estimatedDeparture: '2026-01-01T14:30:00Z',
    gate: 'A12', aircraftType: 'B777', cargoWeightKg: 18500, delayMinutes: 0, progressPct: 0.0 },
  { id:'6E-201', flightNumber:'IGO201', origin:'BOM', destination:'BLR', status:'delayed',
    scheduledDeparture: '2026-01-01T15:00:00Z', estimatedDeparture: '2026-01-01T15:25:00Z',
    gate: 'C04', aircraftType: 'A321', cargoWeightKg: 12000, delayMinutes: 25, progressPct: 0.1 },
  { id:'SG-301', flightNumber:'SEJ301', origin:'DEL', destination:'HYD', status:'on-time',
    scheduledDeparture: '2026-01-01T13:45:00Z', estimatedDeparture: '2026-01-01T13:45:00Z',
    gate: 'A07', aircraftType: 'B737', cargoWeightKg: 8500, delayMinutes: 0, progressPct: 0.0 },
  { id:'AI-202', flightNumber:'AIC202', origin:'BLR', destination:'CCU', status:'delayed',
    scheduledDeparture: '2026-01-01T16:00:00Z', estimatedDeparture: '2026-01-01T16:40:00Z',
    gate: 'D03', aircraftType: 'B787', cargoWeightKg: 14200, delayMinutes: 40, progressPct: 0.0 },
  { id:'6E-401', flightNumber:'IGO401', origin:'MAA', destination:'DEL', status:'on-time',
    scheduledDeparture: '2026-01-01T18:00:00Z', estimatedDeparture: '2026-01-01T18:00:00Z',
    gate: 'B31', aircraftType: 'A320', cargoWeightKg: 9800, delayMinutes: 0, progressPct: 0.0 },
  { id:'IX-501', flightNumber:'AXB501', origin:'BLR', destination:'GOI', status:'on-time',
    scheduledDeparture: '2026-01-01T19:00:00Z', estimatedDeparture: '2026-01-01T19:00:00Z',
    gate: 'C10', aircraftType: 'A320', cargoWeightKg: 6400, delayMinutes: 0, progressPct: 0.0 },
  { id:'SG-601', flightNumber:'SEJ601', origin:'PNQ', destination:'BOM', status:'critical',
    scheduledDeparture: '2026-01-01T20:00:00Z', estimatedDeparture: '2026-01-01T21:30:00Z',
    gate: 'E02', aircraftType: 'B737', cargoWeightKg: 11000, delayMinutes: 90, progressPct: 0.0 },
  { id:'AI-701', flightNumber:'AIC701', origin:'CCU', destination:'MAA', status:'on-time',
    scheduledDeparture: '2026-01-01T21:00:00Z', estimatedDeparture: '2026-01-01T21:00:00Z',
    gate: 'F05', aircraftType: 'B787', cargoWeightKg: 15000, delayMinutes: 0, progressPct: 0.0 },
  { id:'6E-801', flightNumber:'IGO801', origin:'JAI', destination:'BLR', status:'delayed',
    scheduledDeparture: '2026-01-01T22:00:00Z', estimatedDeparture: '2026-01-01T22:15:00Z',
    gate: 'B08', aircraftType: 'A321', cargoWeightKg: 10500, delayMinutes: 15, progressPct: 0.0 },
  { id:'AI-901', flightNumber:'AIC901', origin:'AMD', destination:'DEL', status:'on-time',
    scheduledDeparture: '2026-01-01T23:00:00Z', estimatedDeparture: '2026-01-01T23:00:00Z',
    gate: 'A15', aircraftType: 'B777', cargoWeightKg: 17200, delayMinutes: 0, progressPct: 0.0 },
];

const SEED_CARGO = [
  { id: 'CG-001', flightId: 'AI-101', manifestNumber: 'MNF-9921', weightKg: 18500, capacityKg: 20000, status: 'loaded', hazmat: 0, priority: 'express' },
  { id: 'CG-002', flightId: '6E-201', manifestNumber: 'MNF-8402', weightKg: 12000, capacityKg: 15000, status: 'loaded', hazmat: 1, priority: 'priority' },
  { id: 'CG-003', flightId: 'SG-301', manifestNumber: 'MNF-1029', weightKg: 8500, capacityKg: 10000, status: 'loaded', hazmat: 0, priority: 'standard' },
  { id: 'CG-004', flightId: 'AI-202', manifestNumber: 'MNF-4402', weightKg: 14200, capacityKg: 18000, status: 'loaded', hazmat: 0, priority: 'priority' },
  { id: 'CG-005', flightId: '6E-401', manifestNumber: 'MNF-0019', weightKg: 9800, capacityKg: 12000, status: 'loaded', hazmat: 1, priority: 'express' },
];

async function main() {
  console.log('Seeding database...');
  for (const f of SEED_FLIGHTS) {
    await prisma.flight.upsert({
      where: { id: f.id },
      update: f,
      create: f,
    });
  }
  for (const c of SEED_CARGO) {
    await prisma.cargoShipment.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
