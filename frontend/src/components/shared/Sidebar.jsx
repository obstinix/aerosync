import { NavLink } from 'react-router-dom';
import { Activity, Calendar, Package, AlertTriangle, BarChart2, Sparkles } from 'lucide-react';
import Tooltip from '../Tooltip';

export function Sidebar() {
  const links = [
    { to: '/operations', label: 'Live Operations', icon: Activity, tooltip: 'Real-time flight status across Indian airspace' },
    { to: '/scheduling', label: 'Gantt Timeline', icon: Calendar, tooltip: 'Drag to reschedule flights. Changes auto-save.' },
    { to: '/cargo', label: 'Cargo Intelligence', icon: Package, tooltip: 'Track cargo loads, utilization, and routing' },
    { to: '/simulator', label: 'Disruption Sim', icon: AlertTriangle, tooltip: 'Simulate weather or ATC failures and see cascade effects' },
    { to: '/analytics', label: 'Operations Analytics', icon: BarChart2, tooltip: 'Historical delay trends and hub performance' },
    { to: '/warroom', label: 'AI War Room', icon: Sparkles, tooltip: 'Chat with AI to generate recovery plans in real time' },
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
          <Tooltip key={link.to} content={link.tooltip} placement="right">
            <NavLink
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
          </Tooltip>
        );
      })}
    </aside>
  );
}
