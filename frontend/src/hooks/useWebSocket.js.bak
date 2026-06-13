import { useEffect, useRef, useCallback } from 'react';
import useStore from '../store/useStore';

const STATUSES = ['on-time', 'delayed', 'in-flight', 'boarding', 'landed'];

export default function useWebSocket() {
  const intervalRef = useRef(null);
  const updateFlight = useStore((s) => s.updateFlight);
  const addAlert = useStore((s) => s.addAlert);
  const addNotification = useStore((s) => s.addNotification);
  const flights = useStore((s) => s.flights);
  const setConnected = useStore((s) => s.setConnected);

  const simulateUpdate = useCallback(() => {
    const currentFlights = useStore.getState().flights;
    if (!currentFlights.length) return;

    const idx = Math.floor(Math.random() * currentFlights.length);
    const flight = currentFlights[idx];
    const newStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const delay = newStatus === 'delayed' ? Math.floor(15 + Math.random() * 165) : 0;

    updateFlight(flight.id, {
      status: newStatus,
      delay,
      progress: newStatus === 'in-flight' ? Math.floor(10 + Math.random() * 80) : flight.progress,
    });

    if (newStatus === 'delayed') {
      addAlert({
        id: `ALT-${Date.now()}`,
        flightId: flight.id,
        severity: delay > 90 ? 'critical' : 'warning',
        message: `${flight.id} delayed by ${delay} min (${flight.origin}→${flight.destination})`,
        timestamp: new Date().toISOString(),
      });

      addNotification({
        type: delay > 90 ? 'error' : 'warning',
        title: `Flight ${flight.id} Delayed`,
        message: `New delay: ${delay} minutes`,
      });
    }
  }, [updateFlight, addAlert, addNotification]);

  useEffect(() => {
    setConnected(true);
    const interval = 3000 + Math.random() * 2000;
    intervalRef.current = setInterval(simulateUpdate, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [simulateUpdate, setConnected]);

  return { isConnected: true };
}
