import { motion, AnimatePresence } from 'motion/react';
import { useSocket } from '../../providers/SocketProvider.jsx';
import { useState, useEffect } from 'react';

const SEV_STYLE = {
  critical: { color: 'var(--c-red)',   bg: 'var(--c-red-dim)',   border: 'var(--c-red-border)' },
  warning:  { color: 'var(--c-amber)', bg: 'var(--c-amber-dim)', border: 'var(--c-amber-border)' },
  info:     { color: 'var(--c-sky)',   bg: 'var(--c-sky-dim)',   border: 'var(--c-sky-border)' },
};

export function AlertFeed({ maxItems = 8 }) {
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const onAlert = (alert) => {
      setAlerts(prev => [
        { ...alert, id: Date.now(), ts: new Date().toLocaleTimeString() },
        ...prev.slice(0, maxItems - 1),
      ]);
    };
    socket.on('alert:new', onAlert);
    return () => socket.off('alert:new', onAlert);
  }, [socket, maxItems]);

  return (
    <div>
      <AnimatePresence initial={false}>
        {alerts.map((alert, i) => {
          const s = SEV_STYLE[alert.severity] || SEV_STYLE.info;
          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: 16, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto',
                transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, x: 16, height: 0,
                transition: { duration: 0.18 } }}
              style={{
                marginBottom: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--r-md)',
                background: s.bg,
                border: `1px solid ${s.border}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                color: 'var(--c-cream)', fontWeight: 500, marginBottom: 2 }}>
                {alert.message}
              </div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)', color: 'var(--c-muted)' }}>
                {alert.ts || new Date().toLocaleTimeString()}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
export default AlertFeed;
