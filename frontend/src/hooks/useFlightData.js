import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../providers/SocketProvider.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001';

/**
 * Manages flight state from real Socket.IO events + REST fallback.
 * @returns {{ flights, updateFlight, loading, error }}
 */
export function useFlightData() {
  const { socket, connected } = useSocket();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial load from REST (covers the case where WS connects late)
  useEffect(() => {
    fetch(`${API_URL}/api/flights`)
      .then(r => r.json())
      .then(({ flights: data }) => { setFlights(data || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // Live updates from WebSocket
  useEffect(() => {
    if (!socket) return;

    const onInit = (allFlights) => setFlights(allFlights);
    const onUpdate = (updated) => {
      setFlights(prev => prev.map(f => f.id === updated.id ? updated : f));
    };

    socket.on('flights:init', onInit);
    socket.on('flight:updated', onUpdate);

    return () => {
      socket.off('flights:init', onInit);
      socket.off('flight:updated', onUpdate);
    };
  }, [socket]);

  const updateFlight = useCallback(async (id, patch) => {
    const res = await fetch(`${API_URL}/api/flights/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, []);

  return { flights, updateFlight, loading, error, connected };
}
export default useFlightData;
