import { motion, useSpring, useMotionValue, animate } from 'motion/react';
import { useEffect, useRef } from 'react';

/**
 * HUD metric tile with Motion spring counter animation.
 * @param {{ label: string, value: number, unit?: string, color?: string, barPct: number }} props
 */
function HudTile({ label, value, unit = '', color = 'var(--c-cream)', barPct, suffix = '' }) {
  const displayRef = useRef(null);
  const prevValue = useRef(value);

  useEffect(() => {
    const from = prevValue.current;
    prevValue.current = value;
    const controls = animate(from, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (displayRef.current) {
          displayRef.current.textContent = typeof value === 'float'
            ? v.toFixed(1) : Math.round(v).toString();
        }
      },
    });
    return controls.stop;
  }, [value]);

  return (
    <div style={{
      padding: 'var(--space-3) var(--space-4)',
      borderRight: '1px solid var(--c-border)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)',
        letterSpacing: '0.1em', color: 'var(--c-muted)', textTransform: 'uppercase',
        marginBottom: 'var(--space-1)' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-2xl)',
        fontWeight: 500, color, lineHeight: 1 }}>
        <span ref={displayRef}>{value}</span>
        {suffix && <span style={{ fontSize: 'var(--text-sm)', opacity: 0.5, marginLeft: 2 }}>{suffix}</span>}
      </div>
      {/* Animated progress bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${barPct}%` }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', bottom: 0, left: 0, height: 2,
          background: color, opacity: 0.7,
        }}
      />
    </div>
  );
}

export function HudStrip({ stats }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      borderBottom: '1px solid var(--c-border)',
      background: 'var(--c-bg-secondary)',
    }}>
      <HudTile label="Active Flights" value={stats.active}   barPct={72} />
      <HudTile label="Delayed"        value={stats.delayed}  color="var(--c-amber)" barPct={stats.delayed} />
      <HudTile label="On-Time %"      value={stats.onTimePC} color="var(--c-green)" barPct={stats.onTimePC} suffix="%" />
      <HudTile label="Cargo Util."    value={stats.cargoUtil} barPct={stats.cargoUtil} suffix="%" />
    </div>
  );
}
