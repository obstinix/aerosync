import { useEffect, useState } from 'react';
import { useSocket } from '../../providers/SocketProvider.jsx';
import { Shield, Radio, Bell } from 'lucide-react';

export function Navbar() {
  const { connected } = useSocket();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{
      height: 48,
      background: 'var(--c-bg-secondary)',
      borderBottom: '1px solid var(--c-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-4)',
      position: 'relative',
      zIndex: 100,
    }}>
      {/* Left section: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Shield size={20} color="var(--c-sky)" />
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lg)',
          fontWeight: 700,
          color: 'var(--c-cream)',
          letterSpacing: '0.05em',
        }}>
          AEROSYNC
        </span>
        <span style={{
          fontFamily: 'var(--font-data)',
          fontSize: 'var(--text-xs)',
          background: 'var(--c-sky-dim)',
          color: 'var(--c-sky)',
          border: '1px solid var(--c-sky-border)',
          padding: '1px 6px',
          borderRadius: 'var(--r-sm)',
          marginLeft: 'var(--space-2)',
        }}>
          OPS_CENTER_v2.0
        </span>
      </div>

      {/* Right section: Info & Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {/* UTC Clock */}
        <div style={{
          fontFamily: 'var(--font-data)',
          fontSize: 'var(--text-xs)',
          color: 'var(--c-muted)',
          letterSpacing: '0.05em',
        }}>
          {time.toISOString().replace('T', ' ').substring(0, 19)} UTC
        </div>

        {/* Connection Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--c-border)',
          padding: '4px 10px',
          borderRadius: 'var(--r-md)',
        }}>
          <Radio size={12} color={connected ? 'var(--c-green)' : 'var(--c-red)'} />
          <span style={{
            fontFamily: 'var(--font-data)',
            fontSize: 'var(--text-xs)',
            color: connected ? 'var(--c-green)' : 'var(--c-red)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {connected ? 'LIVE_LINK' : 'LINK_LOST'}
          </span>
        </div>
      </div>
    </header>
  );
}
