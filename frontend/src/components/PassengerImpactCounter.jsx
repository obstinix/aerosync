import { useMemo } from 'react';

/**
 * Passenger Impact Counter Component
 * Computes: Σ (paxLoad × delayMinutes) across flights where status !== 'on-time' (or 'on_time')
 * Style: Bloomberg/SpaceX operations terminal HUD cell
 */
export default function PassengerImpactCounter({ flights }) {
  const totalImpact = useMemo(() => {
    if (!flights || flights.length === 0) return 0;
    return flights.reduce((sum, f) => {
      // Exclude on-time flights
      const isOnTime = f.status === 'on-time' || f.status === 'on_time' || f.status === 'landed';
      if (isOnTime) return sum;
      
      const pax = f.paxLoad || f.passengers || 150; // Default to 150 pax if undefined
      const delay = f.delayMinutes || 0;
      return sum + (pax * delay);
    }, 0);
  }, [flights]);

  const isCritical = totalImpact > 10000;
  const accentColor = isCritical ? '#FF4444' : '#00D4FF';

  // Format number with commas (e.g. 12,847)
  const formattedImpact = totalImpact.toLocaleString();

  return (
    <div
      style={{
        padding: '20px 24px',
        background: 'transparent',
      }}
    >
      <div
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 400,
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#555',
          marginBottom: '8px',
          lineHeight: 1,
        }}
      >
        Passenger Impact
      </div>
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 500,
          fontSize: '32px',
          color: accentColor,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
        }}
      >
        <span>{formattedImpact}</span>
        <span
          style={{
            fontSize: '11px',
            color: '#888888',
            fontFamily: '"Space Grotesk", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 400,
          }}
        >
          pax·min affected
        </span>
      </div>
    </div>
  );
}
