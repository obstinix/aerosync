import { z } from 'zod';

const FlightPatchSchema = z.object({
  status: z.enum(['scheduled', 'on-time', 'delayed', 'cancelled', 'diverted']).optional(),
  gate: z.string().max(10).optional(),
  estimatedDeparture: z.string().datetime().optional(),
  estimatedArrival: z.string().datetime().optional(),
  delayMinutes: z.number().int().min(0).max(1440).optional(),
  progressPct: z.number().min(0).max(1).optional(),
});

export function validateFlightPatch(body) {
  return FlightPatchSchema.safeParse(body);
}
