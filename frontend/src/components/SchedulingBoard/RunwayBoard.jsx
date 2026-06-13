import { motion, AnimatePresence, Reorder } from 'motion/react';
import { useState } from 'react';

const STATUS_COLOR = {
  'on-time': 'var(--c-green)',
  'delayed':  'var(--c-amber)',
  'critical': 'var(--c-red)',
  'cancelled':'var(--c-muted)',
};

function RunwayTrack({ flight, onSelect, selected }) {
  const color = STATUS_COLOR[flight.status] || 'var(--c-sky)';
  const pct = Math.round((flight.progressPct || 0) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelect(flight.id)}
      style={{
        marginBottom: 'var(--space-2)',
        cursor: 'pointer',
        padding: 'var(--space-2)',
        borderRadius: 'var(--r-md)',
        border: `1px solid ${selected ? 'var(--c-sky-border)' : 'transparent'}`,
        background: selected ? 'var(--c-sky-dim)' : 'transparent',
        transition: 'background 0.15s, border-color 0.15s',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
        <span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)',
          color: 'var(--c-muted)', letterSpacing: '0.05em' }}>
          {flight.id} · {flight.origin} → {flight.destination}
        </span>
        <span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)',
          color, letterSpacing: '0.05em' }}>
          {pct}%
        </span>
      </div>

      {/* Track */}
      <div style={{
        position: 'relative', height: 20,
        background: 'var(--c-bg-panel)',
        borderRadius: 'var(--r-sm)',
        overflow: 'hidden',
        border: '1px solid var(--c-border)',
      }}>
        {/* Tick marks */}
        {[25, 50, 75].map(tick => (
          <div key={tick} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${tick}%`, width: 1,
            background: 'var(--c-border)',
          }} />
        ))}

        {/* Progress fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute', top: 0, bottom: 0, left: 0,
            background: `${color}22`,
            display: 'flex', alignItems: 'center',
            justifyContent: 'flex-end', paddingRight: 4,
          }}
        >
          {/* Flight dot */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: color, flexShrink: 0,
              boxShadow: `0 0 6px ${color}`,
            }}
          />
        </motion.div>
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)', color: 'var(--c-muted)' }}>
          STD {flight.scheduledDeparture?.slice(11, 16) || '--:--'}
        </span>
        <span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)',
          color: flight.delayMinutes > 0 ? color : 'var(--c-muted)' }}>
          {flight.delayMinutes > 0 ? `+${flight.delayMinutes}m` : 'ON TIME'}
        </span>
        <span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)', color: 'var(--c-muted)' }}>
          ARR {flight.estimatedArrival?.slice(11, 16) || '--:--'}
        </span>
      </div>
    </motion.div>
  );
}

export function RunwayBoard({ flights = [], onSelect, selectedId }) {
  return (
    <div>
      <AnimatePresence mode="popLayout">
        {flights.map(flight => (
          <RunwayTrack
            key={flight.id}
            flight={flight}
            onSelect={onSelect}
            selected={selectedId === flight.id}
          />
        ))}
      </AnimatePresence>
      {flights.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)',
            color: 'var(--c-muted)', textAlign: 'center', padding: 'var(--space-8)',
            letterSpacing: '0.1em' }}>
          NO FLIGHTS IN THIS VIEW
        </motion.div>
      )}
    </div>
  );
}
export default RunwayBoard;
