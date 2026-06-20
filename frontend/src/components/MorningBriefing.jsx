import { useState, useEffect, useMemo } from 'react';
import useStore from '../store/useStore';

export default function MorningBriefing() {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const flights = useStore(s => s.flights);
  const alerts = useStore(s => s.alerts);

  useEffect(() => {
    // Show only once per session
    if (sessionStorage.getItem('briefing_shown') === '1') {
      setDismissed(true);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const briefing = useMemo(() => {
    if (!flights || flights.length === 0) return null;
    const total = flights.length;
    const delayed = flights.filter(f => f.status === 'delayed').length;
    const critical = flights.filter(f => f.status === 'critical').length;
    const onTime = total - delayed - critical;
    const critAlerts = alerts.filter(a => a.severity === 'critical').length;
    const totalPax = flights.reduce((s, f) => s + (f.passengers || 0), 0);

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const line1 = `${greeting}. AeroSync is monitoring ${total} active flights across the Indian network.`;
    const line2 = `${onTime} flights on-time, ${delayed} delayed${critical > 0 ? `, and ${critical} in critical status` : ''}. ${totalPax.toLocaleString()} passengers tracked.`;
    const line3 = critAlerts > 0
      ? `⚠ ${critAlerts} critical alert${critAlerts > 1 ? 's' : ''} require${critAlerts === 1 ? 's' : ''} immediate attention. Review the War Room for details.`
      : '✓ No critical alerts at this time. Network is operating within normal parameters.';

    return { line1, line2, line3 };
  }, [flights, alerts]);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('briefing_shown', '1');
    setTimeout(() => setDismissed(true), 300);
  };

  if (dismissed || !briefing) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 40}px)`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      zIndex: 200,
      width: '90%',
      maxWidth: 600,
    }}>
      <div style={{
        background: '#0A0A0A',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: '8px',
        padding: '20px 24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 1px rgba(0, 212, 255, 0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(0, 212, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
            }}>
              🛫
            </div>
            <span style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              color: '#00D4FF',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              AI NETWORK BRIEFING
            </span>
          </div>
          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#555',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px',
              lineHeight: 1,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = '#888'}
            onMouseLeave={e => e.target.style.color = '#555'}
          >
            ✕
          </button>
        </div>

        {/* Briefing lines */}
        <div style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: '13px',
          color: '#C0C0C0',
          lineHeight: 1.6,
        }}>
          <p style={{ margin: '0 0 8px 0' }}>{briefing.line1}</p>
          <p style={{ margin: '0 0 8px 0' }}>{briefing.line2}</p>
          <p style={{
            margin: 0,
            color: briefing.line3.startsWith('⚠') ? '#FFB020' : '#00D4FF',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '11px',
          }}>
            {briefing.line3}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '14px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '9px',
            color: '#555',
            letterSpacing: '0.06em',
          }}>
            GENERATED {new Date().toISOString().replace('T', ' ').substring(0, 16)} UTC
          </span>
          <button
            onClick={handleDismiss}
            style={{
              padding: '4px 12px',
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.25)',
              borderRadius: '4px',
              color: '#00D4FF',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '10px',
              cursor: 'pointer',
              letterSpacing: '0.06em',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(0, 212, 255, 0.15)'}
            onMouseLeave={e => e.target.style.background = 'rgba(0, 212, 255, 0.08)'}
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
