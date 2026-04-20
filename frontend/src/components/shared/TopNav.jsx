import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';

export default function TopNav() {
  const activeScreen = useStore((s) => s.activeScreen);
  const setActiveScreen = useStore((s) => s.setActiveScreen);
  const isConnected = useStore((s) => s.isConnected);
  const alerts = useStore((s) => s.alerts);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const screens = [
    { id: 'dashboard', label: '🌍 Dashboard' },
    { id: 'scheduling', label: '📊 Scheduling' },
    { id: 'cargo', label: '📦 Cargo' },
    { id: 'disruption', label: '⚡ Disruption' },
  ];

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <nav className="top-nav">
      <div className="logo">
        <svg viewBox="0 0 28 28" fill="none">
          <path d="M14 2L2 14l12 12 12-12L14 2z" stroke="#00E5FF" strokeWidth="1.5" fill="none"/>
          <path d="M14 8l-6 6 6 6 6-6-6-6z" fill="#00E5FF" opacity="0.3"/>
          <path d="M14 11l-3 3 3 3 3-3-3-3z" fill="#00E5FF"/>
        </svg>
        AeroSync
      </div>
      <div className="nav-links">
        {screens.map((s) => (
          <button key={s.id} className={activeScreen === s.id ? 'active' : ''} onClick={() => setActiveScreen(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="nav-right">
        <span className="clock">
          {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          {' · '}
          {time.toLocaleTimeString('en-US', { hour12: false })}
          {' UTC'}
        </span>
        <button className="alert-bell">
          🔔
          {criticalCount > 0 && <span className="badge">{criticalCount}</span>}
        </button>
        <div className={`connection-dot${isConnected ? '' : ' disconnected'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
      </div>
    </nav>
  );
}
