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
      width: 200,
      background: 'var(--c-bg-secondary)',
      borderRight: '1px solid var(--c-border)',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--space-4) var(--space-2)',
      gap: 'var(--space-1)',
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
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--r-md)',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--c-cream)' : 'var(--c-muted)',
              background: isActive ? 'var(--c-bg-tertiary)' : 'transparent',
              border: isActive ? '1px solid var(--c-border-hi)' : '1px solid transparent',
              transition: 'all var(--dur-fast) var(--ease-out)',
            })}
          >
            <Icon size={16} />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
}
