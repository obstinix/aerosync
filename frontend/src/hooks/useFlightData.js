import { useMemo } from 'react';
import useStore from '../store/useStore';

export default function useFlightData() {
  const flights = useStore((s) => s.flights);
  const alerts = useStore((s) => s.alerts);
  const cargoManifests = useStore((s) => s.cargoManifests);

  const stats = useMemo(() => {
    const active = flights.filter(
      (f) => ['in-flight', 'boarding', 'on-time'].includes(f.status)
    ).length;
    const delayed = flights.filter((f) => f.status === 'delayed').length;
    const total = flights.length;
    const onTimePercent = total > 0 ? Math.round(((total - delayed) / total) * 100) : 0;
    const totalCargo = flights.reduce((sum, f) => sum + f.cargoWeight, 0);
    const totalMaxCargo = flights.reduce((sum, f) => sum + f.maxCargo, 0);
    const cargoUtilization = totalMaxCargo > 0 ? Math.round((totalCargo / totalMaxCargo) * 100) : 0;
    return { active, delayed, onTimePercent, cargoUtilization, total, totalCargo };
  }, [flights]);

  const flightsByStatus = useMemo(() => {
    const grouped = {};
    flights.forEach((f) => {
      if (!grouped[f.status]) grouped[f.status] = [];
      grouped[f.status].push(f);
    });
    return grouped;
  }, [flights]);

  const overloadedFlights = useMemo(
    () => flights.filter((f) => f.cargoUtilization > 90),
    [flights]
  );

  const revenueAtRisk = useMemo(
    () =>
      cargoManifests
        .filter((m) => m.utilization > 90)
        .reduce((sum, m) => sum + m.revenue, 0),
    [cargoManifests]
  );

  return {
    flights,
    alerts,
    cargoManifests,
    stats,
    flightsByStatus,
    overloadedFlights,
    revenueAtRisk,
  };
}
