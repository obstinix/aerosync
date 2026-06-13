import { useMemo } from 'react';
import useFlightData from '../hooks/useFlightData.js';
import GlobeView from '../components/Globe/GlobeView';
import FlightPopup from '../components/Globe/FlightPopup';
import { HudStrip } from '../components/shared/HudStrip.jsx';
import { AlertFeed } from '../components/shared/AlertFeed.jsx';

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
      {/* Upper Area: Globe and Alerts side-by-side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 1fr',
        flex: 1,
        minHeight: 0,
        position: 'relative',
      }}>
        {/* Globe Visualization */}
        <div style={{ position: 'relative', borderRight: '1px solid var(--c-border)', minHeight: 0 }}>
          <GlobeView />
          <FlightPopup />
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

      {/* Bottom Area: HUD Strip */}
      <HudStrip stats={stats} />
    </div>
  );
}
