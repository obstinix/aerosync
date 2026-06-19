import { useMemo } from 'react';
import useFlightData from '../hooks/useFlightData.js';
import GlobeView from '../components/Globe/GlobeView';
import FlightPopup from '../components/Globe/FlightPopup';
import { StatsPanel } from '../components/shared/StatsPanel.jsx';
import { FlightList } from '../components/shared/FlightList.jsx';
import { AlertFeed } from '../components/shared/AlertFeed.jsx';
import ATCAudioWidget from '../components/ATCAudioWidget.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

const AIRCRAFT_CAPACITY = {
  B777: 20000,
  A380: 30000,
  B787: 18000,
  A321: 10000,
  A350: 30000,
};

export default function DashboardPage() {
  const { flights, loading, error } = useFlightData();

  const stats = useMemo(() => {
    if (!flights || flights.length === 0) {
      return { active: 0, delayed: 0, onTimePC: 100, cargoUtil: 0 };
    }

    const active = flights.filter(f => f.progressPct > 0 && f.progressPct < 1 && f.status !== 'cancelled').length || flights.length;
    const delayed = flights.filter(f => f.status === 'delayed' || f.status === 'critical').length;
    const onTimePC = Math.round(((flights.length - delayed) / flights.length) * 100);

    let totalWeight = 0;
    let totalCapacity = 0;
    flights.forEach(f => {
      const cap = AIRCRAFT_CAPACITY[f.aircraftType] || 20000;
      totalWeight += f.cargoWeightKg || 0;
      totalCapacity += cap;
    });
    const cargoUtil = totalCapacity > 0 ? Math.round((totalWeight / totalCapacity) * 100) : 0;

    return { active, delayed, onTimePC, cargoUtil };
  }, [flights]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--c-muted)', fontFamily: 'var(--font-data)' }}>
        RECEIVING OPERATIONS STREAM...
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--c-bg-primary)',
    }}>
      {/* Upper Area: Globe/FlightList and Alerts side-by-side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 1fr',
        flex: 1,
        minHeight: 0,
        position: 'relative',
      }}>
        {/* Left Column: Globe and FlightList */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--c-border)',
          minHeight: 0,
          overflow: 'hidden',
        }}>
          <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
            <ErrorBoundary
              fallback={
                <div style={{
                  height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', background: '#0d0d0d',
                  border: '1px solid #FF4444', color: '#FF4444', fontFamily: 'var(--font-display)',
                  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em'
                }}>
                  <span>Geospatial Feed Breakdown (WebGL/Map Context Loss)</span>
                  <button
                    onClick={() => window.location.reload()}
                    style={{
                      marginTop: '12px', padding: '4px 8px', background: 'transparent',
                      border: '1px solid #FF4444', color: '#FF4444', cursor: 'pointer',
                      fontSize: '10px', fontFamily: 'var(--font-data)'
                    }}
                  >
                    Re-Init Stream
                  </button>
                </div>
              }
            >
              <GlobeView />
              <FlightPopup />
            </ErrorBoundary>
          </div>
          <div style={{
            height: '280px',
            overflowY: 'auto',
            borderTop: '1px solid var(--c-border)',
            padding: 'var(--space-4)',
            background: 'rgba(0,0,0,0.3)',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              color: 'var(--c-cream)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-3)',
              borderBottom: '1px solid var(--c-border)',
              paddingBottom: 'var(--space-1)',
            }}>
              LIVE FLIGHT STATUS
            </h3>
            <FlightList flights={flights} />
          </div>
        </div>

        {/* Live Alerts feed */}
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
          }}>
            SYSTEM ALERTS
          </h3>
          <AlertFeed maxItems={10} />
        </div>
      </div>

      {/* Bottom Area: Stats Panel */}
      <StatsPanel stats={stats} flights={flights} />
      <ATCAudioWidget />
    </div>
  );
}
