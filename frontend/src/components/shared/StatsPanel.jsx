import { useRef, useState, useEffect, useCallback } from 'react';
import { useInView } from 'motion/react';

/**
 * Eased count-up from 0 → target over `duration` ms.
 * Uses cubic ease-out: 1 - (1 - t)^3
 */
function useCountUp(target, trigger, duration = 600) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;

    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, trigger, duration]);

  return display;
}

function StatCell({ label, value, accent = false, suffix = '', trigger }) {
  const display = useCountUp(value, trigger);

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
        {label}
      </div>
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 500,
          fontSize: '32px',
          color: accent ? '#00D4FF' : '#F5F5F5',
          lineHeight: 1,
        }}
      >
        {display}
        {suffix && (
          <span
            style={{
              fontSize: '18px',
              color: accent ? '#00D4FF' : '#888888',
              marginLeft: '2px',
            }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Data-dense stats grid — Bloomberg terminal aesthetic.
 * @param {{ stats: { active: number, delayed: number, onTimePC: number, cargoUtil: number } }} props
 */
export function StatsPanel({ stats }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '0px',
      }}
    >
      <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <StatCell
          label="Active Flights"
          value={stats.active}
          accent
          trigger={isInView}
        />
      </div>
      <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <StatCell
          label="Delayed"
          value={stats.delayed}
          trigger={isInView}
        />
      </div>
      <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <StatCell
          label="On-Time"
          value={stats.onTimePC}
          suffix="%"
          trigger={isInView}
        />
      </div>
      <div>
        <StatCell
          label="Cargo Util."
          value={stats.cargoUtil}
          suffix="%"
          trigger={isInView}
        />
      </div>
    </div>
  );
}
