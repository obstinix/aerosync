import { NavLink } from 'react-router-dom';
import { Activity, Calendar, Package, AlertTriangle } from 'lucide-react';

export function Sidebar() {
  const links = [
    { to: '/', label: 'Live Operations', icon: Activity },
    { to: '/scheduling', label: 'Gantt Timeline', icon: Calendar },
    { to: '/cargo', label: 'Cargo Intelligence', icon: Package },
    { to: '/simulator', label: 'Disruption Sim', icon: AlertTriangle },
  ];

  return (
    <aside style={{
      width: 220,
      background: '#0d0d0d',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 12px',
      gap: '4px',
      height: '100%',
    }}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              borderRadius: '2px',
              textDecoration: 'none',
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: isActive ? '#00D4FF' : '#888888',
              background: isActive ? 'rgba(0, 212, 255, 0.04)' : 'transparent',
              borderLeft: isActive ? '2px solid #00D4FF' : '2px solid transparent',
              transition: 'all 0.15s ease-out',
            })}
          >
            <Icon size={16} />
            <span style={{ letterSpacing: '0.04em' }}>{link.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
}
