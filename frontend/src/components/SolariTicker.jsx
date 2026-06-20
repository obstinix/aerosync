import { useState, useEffect, useRef, useMemo, memo } from 'react';
import useStore from '../store/useStore';

// ── Constants ──────────────────────────────────────────────────────────
const ROW_WIDTH = 40;
const FLIP_DURATION_MS = 120;
const CYCLE_INTERVAL_MS = 4000;
const CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 →·-';

// ── CSS Keyframes (injected once) ──────────────────────────────────────
const STYLE_ID = 'solari-ticker-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes solariFlipOut {
      0%   { transform: rotateX(0deg);   opacity: 1; }
      100% { transform: rotateX(-90deg); opacity: 0; }
    }
    @keyframes solariFlipIn {
      0%   { transform: rotateX(90deg);  opacity: 0; }
      100% { transform: rotateX(0deg);   opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// ── Helpers ────────────────────────────────────────────────────────────
function padRow(str) {
  return str.toUpperCase().padEnd(ROW_WIDTH).slice(0, ROW_WIDTH);
}

function formatFlight(flight) {
  const id = flight.flightNumber || flight.id || '???';
  const origin = flight.origin || '???';
  const dest = flight.destination || '???';

  let statusText;
  if (flight.status === 'critical') {
    statusText = 'CRITICAL';
  } else if (flight.status === 'delayed' && flight.delay > 0) {
    statusText = `DELAY ${flight.delay}M`;
  } else {
    statusText = 'ON TIME';
  }

  // Format: "AI-101  DEL→BOM  ON TIME"
  const raw = `${id}  ${origin}→${dest}  ${statusText}`;
  return padRow(raw);
}

function getStatusForFlight(flight) {
  if (flight.status === 'critical') return 'critical';
  if (flight.status === 'delayed' && flight.delay > 0) return 'delayed';
  return 'on-time';
}

function getCharColor(status, charIndex, text) {
  // Find where the status portion starts in the formatted string
  // We colorize the status portion (everything after the last double-space before status)
  const statusStart = text.lastIndexOf('  ');
  if (charIndex > statusStart + 1) {
    if (status === 'critical') return '#FF4444';
    if (status === 'delayed') return '#FFB020';
    return '#00D4FF';
  }
  return '#00D4FF';
}

// ── Single flip cell ───────────────────────────────────────────────────
const FlipCell = memo(function FlipCell({ char, color, flipKey }) {
  const [displayChar, setDisplayChar] = useState(char);
  const [animState, setAnimState] = useState('idle'); // idle | flip-out | flip-in
  const prevFlipKey = useRef(flipKey);
  const flipTimeout = useRef(null);

  useEffect(() => {
    if (prevFlipKey.current === flipKey) {
      // First render — just show the character, no animation
      setDisplayChar(char);
      return;
    }

    prevFlipKey.current = flipKey;

    // Phase 1: flip old character out
    setAnimState('flip-out');

    flipTimeout.current = setTimeout(() => {
      // Phase 2: swap character and flip in
      setDisplayChar(char);
      setAnimState('flip-in');

      flipTimeout.current = setTimeout(() => {
        setAnimState('idle');
      }, FLIP_DURATION_MS);
    }, FLIP_DURATION_MS);

    return () => clearTimeout(flipTimeout.current);
  }, [char, flipKey]);

  const animStyle =
    animState === 'flip-out'
      ? { animation: `solariFlipOut ${FLIP_DURATION_MS}ms ease-in forwards` }
      : animState === 'flip-in'
        ? { animation: `solariFlipIn ${FLIP_DURATION_MS}ms ease-out forwards` }
        : {};

  return (
    <span
      style={{
        display: 'inline-block',
        width: 16,
        height: 28,
        lineHeight: '28px',
        textAlign: 'center',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 13,
        fontWeight: 500,
        color: color,
        background: '#0A0A0A',
        border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: 2,
        margin: '0 1px',
        perspective: '200px',
        transformStyle: 'preserve-3d',
        letterSpacing: 0,
        ...animStyle,
      }}
    >
      {displayChar}
    </span>
  );
});

// ── Main Component ─────────────────────────────────────────────────────
function SolariTicker() {
  const flights = useStore((s) => s.flights);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flipGeneration = useRef(0);

  // Inject CSS keyframes on mount
  useEffect(() => {
    injectStyles();
  }, []);

  // Build formatted board rows from store flights
  const boardRows = useMemo(() => {
    if (!flights || flights.length === 0) {
      return [{ text: padRow('NO FLIGHTS AVAILABLE'), status: 'on-time' }];
    }
    return flights.map((f) => ({
      text: formatFlight(f),
      status: getStatusForFlight(f),
    }));
  }, [flights]);

  // Auto-cycle
  useEffect(() => {
    if (boardRows.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        flipGeneration.current += 1;
        return (prev + 1) % boardRows.length;
      });
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [boardRows.length]);

  const currentRow = boardRows[currentIndex] || boardRows[0];
  const chars = currentRow.text.split('');

  return (
    <div
      style={{
        width: '100%',
        height: 48,
        background: '#000000',
        borderBottom: '1px solid rgba(0,212,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Subtle mechanical-divider line at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.12) 20%, rgba(0,212,255,0.12) 80%, transparent 100%)',
        }}
      />

      {/* Board label */}
      <span
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 9,
          fontWeight: 600,
          color: 'rgba(0,212,255,0.35)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginRight: 16,
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        DEPARTURES
      </span>

      {/* Flip cells */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
        }}
      >
        {chars.map((ch, i) => (
          <FlipCell
            key={i}
            char={ch}
            color={getCharColor(currentRow.status, i, currentRow.text)}
            flipKey={`${flipGeneration.current}-${i}-${ch}`}
          />
        ))}
      </div>

      {/* Flight counter */}
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9,
          color: 'rgba(255,255,255,0.2)',
          marginLeft: 16,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          letterSpacing: '0.04em',
        }}
      >
        {String(currentIndex + 1).padStart(2, '0')}/{String(boardRows.length).padStart(2, '0')}
      </span>
    </div>
  );
}

export default SolariTicker;
