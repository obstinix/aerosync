import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { useSocket } from '../../providers/SocketProvider.jsx';
import { useEffect, useState } from 'react';

const links = [
  { to: '/operations', label: 'OPERATIONS' },
  { to: '/scheduling', label: 'SCHEDULING' },
  { to: '/cargo', label: 'CARGO' },
  { to: '/simulator', label: 'DISRUPTIONS' },
];

export function Navbar() {
  const { connected } = useSocket();
  const [time, setTime] = useState(new Date());

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

      {/* Right: Clock + Connection */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
