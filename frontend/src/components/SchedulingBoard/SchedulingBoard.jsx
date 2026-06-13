import { useState, useEffect, useMemo } from 'react';
import useFlightData from '../../hooks/useFlightData.js';
import RunwayBoard from './RunwayBoard.jsx';
import { Calendar, Cpu, MapPin } from 'lucide-react';

const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

export default function SchedulingBoard() {
  const { flights, updateFlight, loading, error } = useFlightData();
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [hub, setHub] = useState('ALL');
  const [predictions, setPredictions] = useState({});
  const [expandedPred, setExpandedPred] = useState(null);

  const filteredFlights = useMemo(() => {
    if (!flights) return [];
    if (hub === 'ALL') return flights;
    return flights.filter(f => f.origin === hub || f.destination === hub);
  }, [flights, hub]);

  // Fetch AI prediction for flights when they load
  useEffect(() => {
    if (!flights || flights.length === 0) return;
    
    // Fetch predictions for all active flights
    flights.forEach(async (flight) => {
      if (predictions[flight.id]) return;
      try {
        const res = await fetch(`${AI_URL}/predict/delay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            airline_code: flight.flightNumber.slice(0, 2) || 'AE',
            origin: flight.origin,
            destination: flight.destination,
            day_of_week: new Date(flight.scheduledDeparture).getDay() || 1,
            departure_time: parseInt(flight.scheduledDeparture?.slice(11, 16).replace(':', '')) || 1200,
            flight_length_min: 180,
            weather_score: flight.status === 'critical' ? 0.8 : 0.2,
          }),
        });
        if (res.ok) {
          const pred = await res.json();
          setPredictions(prev => ({ ...prev, [flight.id]: pred }));
        }
      } catch (err) {
        console.error('[AI] Prediction fetch error:', err);
      }
    });
  }, [flights]);

  const selectedFlight = useMemo(() => {
    return flights.find(f => f.id === selectedFlightId);
  }, [flights, selectedFlightId]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      height: '100%',
      background: 'var(--c-bg-primary)',
    }}>
      {/* Left: Gantt / Runway Track list */}
      <div style={{
        padding: 'var(--space-4)',
        borderRight: '1px solid var(--c-border)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'center',
          marginBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--c-border)',
          paddingBottom: 'var(--space-3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <MapPin size={16} color="var(--c-muted)" />
            <select
              value={hub}
              onChange={(e) => setHub(e.target.value)}
              style={{
                background: 'var(--c-bg-tertiary)',
                color: 'var(--c-cream)',
                border: '1px solid var(--c-border-hi)',
                borderRadius: 'var(--r-md)',
                padding: '4px 8px',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <option value="ALL">All Hubs</option>
              <option value="JFK">JFK — New York</option>
              <option value="EWR">EWR — Newark</option>
              <option value="LHR">LHR — London</option>
              <option value="CDG">CDG — Paris</option>
              <option value="DXB">DXB — Dubai</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Calendar size={16} color="var(--c-muted)" />
            <span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)', color: 'var(--c-muted)' }}>
              TODAY'S OPERATIONS
            </span>
          </div>
        </div>

        {/* Board */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', fontFamily: 'var(--font-data)', color: 'var(--c-muted)' }}>
            SYNCHRONIZING SCHEDULES...
          </div>
        ) : (
          <RunwayBoard
            flights={filteredFlights}
            onSelect={setSelectedFlightId}
            selectedId={selectedFlightId}
          />
        )}
      </div>

      {/* Right: AI Intelligence panel */}
      <div style={{
        padding: 'var(--space-4)',
        background: 'var(--c-bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          color: 'var(--c-cream)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--c-border)',
          paddingBottom: 'var(--space-2)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}>
          <Cpu size={16} color="var(--c-sky)" />
          AI DISPATCH ADVISORY
        </h3>

        {selectedFlight ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Flight info card */}
            <div style={{
              background: 'var(--c-bg-tertiary)',
              border: '1px solid var(--c-border-hi)',
              borderRadius: 'var(--r-lg)',
              padding: 'var(--space-3)',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                {selectedFlight.id}
              </div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)', color: 'var(--c-muted)', marginTop: 2 }}>
                ROUTE: {selectedFlight.origin} → {selectedFlight.destination}
              </div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)', color: 'var(--c-muted)' }}>
                AIRCRAFT: {selectedFlight.aircraftType}
              </div>
            </div>

            {/* AI suggestion */}
            {predictions[selectedFlight.id] ? (
              <div style={{
                background: 'rgba(27,79,216,0.05)',
                border: '1px solid var(--c-sky-border)',
                borderRadius: 'var(--r-lg)',
                padding: 'var(--space-3)',
                position: 'relative',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--c-cream)' }}>
                  Delay Risk Prediction
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--c-muted)',
                  marginTop: 'var(--space-1)',
                  marginBottom: 'var(--space-3)',
                }}>
                  {predictions[selectedFlight.id].estimated_delay_minutes > 0
                    ? `System advises high likelihood of delay (+${predictions[selectedFlight.id].estimated_delay_minutes} mins estimated). Consider scheduling alternative gate/aircraft slots.`
                    : 'System predicts on-time departure. Standard dispatch protocols recommended.'}
                </div>

                {/* Probability bar */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)', marginBottom: 2 }}>
                    <span>Delay Probability</span>
                    <span style={{ color: 'var(--c-sky)' }}>
                      {(predictions[selectedFlight.id].delay_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--c-bg-panel)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${predictions[selectedFlight.id].delay_probability * 100}%`,
                      background: 'var(--c-sky)',
                    }} />
                  </div>
                </div>

                {/* Explanations (Explainable AI) */}
                <button
                  onClick={() => setExpandedPred(expandedPred === selectedFlight.id ? null : selectedFlight.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--c-sky)',
                    fontFamily: 'var(--font-data)',
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {expandedPred === selectedFlight.id ? 'Hide factors [-]' : 'Why this prediction? [+]'}
                </button>

                {expandedPred === selectedFlight.id && (
                  <div style={{
                    marginTop: 'var(--space-2)',
                    paddingTop: 'var(--space-2)',
                    borderTop: '1px solid var(--c-border)',
                    fontFamily: 'var(--font-data)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--c-muted)',
                    lineHeight: '1.4',
                  }}>
                    <strong>Factors:</strong> {predictions[selectedFlight.id].reason}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)', color: 'var(--c-muted)' }}>
                CALCULATING MODEL PREDICTION...
              </div>
            )}
          </div>
        ) : (
          <div style={{
            fontFamily: 'var(--font-data)',
            fontSize: 'var(--text-xs)',
            color: 'var(--c-muted)',
            textAlign: 'center',
            padding: 'var(--space-8)',
          }}>
            SELECT A FLIGHT BLOCK TO VIEW AI DISPATCH INSIGHTS
          </div>
        )}
      </div>
    </div>
  );
}
