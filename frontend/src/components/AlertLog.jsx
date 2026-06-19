import { useState, useMemo, useEffect } from 'react';
import useStore from '../store/useStore';
import { useSocket } from '../providers/SocketProvider.jsx';
import { ShieldAlert, AlertTriangle, CheckCircle, Download, Check } from 'lucide-react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';

const SEV_STYLE = {
  critical: { color: 'var(--c-red)',   bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)' },
  warning:  { color: 'var(--c-amber)', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  nominal:  { color: 'var(--c-green)', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  info:     { color: 'var(--c-sky)',   bg: 'rgba(0,212,255,0.1)',  border: 'rgba(0,212,255,0.2)' },
};

export default function AlertLog() {
  const alerts = useStore((s) => s.alerts);
  const addAlert = useStore((s) => s.addAlert);
  const acknowledgeAlert = useStore((s) => s.acknowledgeAlert);
  const acknowledgeAllAlerts = useStore((s) => s.acknowledgeAllAlerts);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const { socket } = useSocket();

  // Listen to live alerts from socket and add them to the global store
  useEffect(() => {
    if (!socket) return;
    const handleNewAlert = (newAlert) => {
      addAlert({
        id: newAlert.id || `ALT-${Date.now()}`,
        flightId: newAlert.flightId || 'GLOBAL',
        severity: newAlert.severity || 'info',
        message: newAlert.message || '',
        timestamp: newAlert.timestamp || new Date().toISOString(),
      });
    };
    socket.on('alert:new', handleNewAlert);
    return () => socket.off('alert:new', handleNewAlert);
  }, [socket, addAlert]);

  const filteredAlerts = useMemo(() => {
    if (filterSeverity === 'ALL') return alerts;
    return alerts.filter(a => a.severity === filterSeverity);
  }, [alerts, filterSeverity]);

  const exportAlertsCSV = () => {
    const csv = Papa.unparse(filteredAlerts.map(a => ({
      ID: a.id,
      Flight: a.flightId,
      Severity: a.severity.toUpperCase(),
      Message: a.message,
      Timestamp: a.timestamp,
      Acknowledged: a.acknowledged ? 'YES' : 'NO'
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `alert_log_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityIcon = (sev) => {
    switch (sev) {
      case 'critical':
        return <ShieldAlert size={14} style={{ color: 'var(--c-red)' }} />;
      case 'warning':
        return <AlertTriangle size={14} style={{ color: 'var(--c-amber)' }} />;
      default:
        return <CheckCircle size={14} style={{ color: 'var(--c-green)' }} />;
    }
  };

  function timeAgo(ts) {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Controls panel */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-3)',
        borderBottom: '1px solid var(--c-border)',
        paddingBottom: 'var(--space-3)'
      }}>
        {/* Count statistics */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--c-muted)', fontFamily: 'var(--font-data)' }}>
            ACTIVE UNACKNOWLEDGED:
          </span>
          <span style={{
            background: 'rgba(255,68,68,0.1)',
            color: 'var(--c-red)',
            fontSize: '11px',
            fontFamily: 'var(--font-data)',
            padding: '2px 8px',
            fontWeight: 700,
            border: '1px solid rgba(255,68,68,0.2)'
          }}>
            {alerts.filter(a => !a.acknowledged).length}
          </span>
        </div>

        {/* Severity filter select */}
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          style={{
            background: 'var(--c-bg-tertiary)',
            color: 'var(--c-cream)',
            border: '1px solid var(--c-border-hi)',
            borderRadius: 'var(--r-md)',
            padding: '6px 10px',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            outline: 'none',
            width: '100%'
          }}
        >
          <option value="ALL">All Severities</option>
          <option value="critical">🔴 Critical</option>
          <option value="warning">🟡 Warning</option>
          <option value="nominal">🟢 Nominal</option>
        </select>

        {/* Action button strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
          <button
            onClick={acknowledgeAllAlerts}
            style={{
              background: 'transparent',
              border: '1px solid var(--c-border-hi)',
              borderRadius: 'var(--r-md)',
              color: 'var(--c-cream)',
              padding: '6px 8px',
              fontSize: '11px',
              fontFamily: 'var(--font-data)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4
            }}
          >
            <Check size={12} /> ACK ALL
          </button>

          <button
            onClick={exportAlertsCSV}
            style={{
              background: 'transparent',
              border: '1px solid var(--c-border-hi)',
              borderRadius: 'var(--r-md)',
              color: 'var(--c-sky)',
              padding: '6px 8px',
              fontSize: '11px',
              fontFamily: 'var(--font-data)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4
            }}
          >
            <Download size={12} /> EXPORT CSV
          </button>
        </div>
      </div>

      {/* List content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)'
      }}>
        <AnimatePresence initial={false}>
          {filteredAlerts.map((a) => {
            const style = SEV_STYLE[a.severity] || SEV_STYLE.info;
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: a.acknowledged ? 0.45 : 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{
                  background: a.acknowledged ? 'rgba(255,255,255,0.01)' : style.bg,
                  border: `1px solid ${a.acknowledged ? 'rgba(255,255,255,0.03)' : style.border}`,
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--r-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 'var(--space-2)',
                  transition: 'opacity 0.2s, background-color 0.2s'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {getSeverityIcon(a.severity)}
                    <span style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: style.color,
                      textTransform: 'uppercase'
                    }}>
                      {a.severity}
                    </span>
                    {a.flightId !== 'GLOBAL' && (
                      <span style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: '10px',
                        color: 'var(--c-sky)',
                        fontWeight: 600
                      }}>
                        {a.flightId}
                      </span>
                    )}
                    <span style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: '9px',
                      color: 'var(--c-muted)',
                      marginLeft: 'auto'
                    }}>
                      {timeAgo(a.timestamp)}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--c-cream)',
                    lineHeight: '1.4'
                  }}>
                    {a.message}
                  </div>
                </div>

                {!a.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(a.id)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--c-border-hi)',
                      borderRadius: 'var(--r-sm)',
                      color: 'var(--c-cream)',
                      padding: '2px 6px',
                      fontSize: '9px',
                      fontFamily: 'var(--font-data)',
                      cursor: 'pointer',
                      alignSelf: 'center',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    ACK
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAlerts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-8)',
            fontFamily: 'var(--font-data)',
            color: 'var(--c-muted)',
            fontSize: 'var(--text-xs)'
          }}>
            SYSTEM CLEAR — NO ACTIVE ALERTS
          </div>
        )}
      </div>
    </div>
  );
}
