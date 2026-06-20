import { motion } from 'motion/react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSocket } from '../../providers/SocketProvider.jsx';
import { useEffect, useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import { soundManager } from '../../utils/soundManager';

const links = [
  { to: '/operations', label: 'OPERATIONS' },
  { to: '/scheduling', label: 'SCHEDULING' },
  { to: '/cargo', label: 'CARGO' },
  { to: '/simulator', label: 'DISRUPTIONS' },
];

function NetworkHealthBadge() {
  const flights = useStore(s => s.flights);
  const navigate = useNavigate();

  const score = useMemo(() => {
    if (!flights || flights.length === 0) return 100;
    const total = flights.length;
    const delayed = flights.filter(f => f.status === 'delayed').length;
    const critical = flights.filter(f => f.status === 'critical').length;
    // Score: 100 base, -3 per delayed, -8 per critical
    return Math.max(0, Math.min(100, Math.round(100 - (delayed * 3 + critical * 8) * (100 / total))));
  }, [flights]);

  const color = score >= 80 ? '#00D4FF' : score >= 50 ? '#FFB020' : '#FF4444';

  return (
    <button
      onClick={() => navigate('/analytics')}
      title="Network Health — click for details"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        background: 'rgba(0,0,0,0.4)',
        border: `1px solid ${color}33`,
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'border-color 0.3s',
      }}
    >
      <div style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 6px ${color}66`,
        animation: 'pulse 2s ease-in-out infinite',
      }} />
      <span style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10,
        color: color,
        fontWeight: 600,
        letterSpacing: '0.04em',
      }}>
        {score}
      </span>
    </button>
  );
}

export function Navbar() {
  const { connected } = useSocket();
  const [time, setTime] = useState(new Date());
  const [muted, setMuted] = useState(soundManager.isMuted());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 48,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 100,
    }}>
      {/* Left: Wordmark */}
      <span style={{
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 600,
        fontSize: 16,
        color: '#F5F5F5',
        letterSpacing: '0.15em',
      }}>
        AEROSYNC
      </span>

      {/* Center: Nav links */}
      <nav style={{ display: 'flex', gap: 4 }}>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              textDecoration: 'none',
            })}
          >
            {({ isActive }) => (
              <motion.span
                whileHover={{ color: '#00D4FF' }}
                transition={{ duration: 0.15 }}
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 500,
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  color: isActive ? '#00D4FF' : '#888888',
                  padding: '8px 16px',
                  display: 'inline-block',
                  cursor: 'pointer',
                  borderBottom: isActive ? '1px solid #00D4FF' : '1px solid transparent',
                }}
              >
                {link.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Right: Health Badge + Clock + Connection */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <NetworkHealthBadge />

        {/* Audio Mute Button */}
        <button
          onClick={() => {
            const nextMuted = soundManager.toggleMute();
            setMuted(nextMuted);
          }}
          title={muted ? "Unmute sound effects" : "Mute sound effects"}
          style={{
            background: 'none',
            border: 'none',
            color: muted ? '#FF4444' : '#00D4FF',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 6px',
            opacity: 0.85,
            transition: 'color 0.15s ease-out, opacity 0.15s ease-out',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.85}
        >
          {muted ? '🔇' : '🔊'}
        </button>

        <span style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          color: '#888888',
          letterSpacing: '0.03em',
        }}>
          {time.toISOString().replace('T', ' ').substring(0, 19)} UTC
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: connected ? '#00D4FF' : '#FF4444',
            boxShadow: connected ? '0 0 6px rgba(0,212,255,0.5)' : 'none',
          }} />
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            color: connected ? '#00D4FF' : '#FF4444',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </header>
  );
}
