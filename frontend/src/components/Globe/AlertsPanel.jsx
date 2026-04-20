import useStore from '../../store/useStore';

export default function AlertsPanel() {
  const alerts = useStore((s) => s.alerts);

  function timeAgo(ts) {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  return (
    <div className="alerts-panel glass-panel">
      <h3>⚡ Live Alerts</h3>
      {alerts.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📡</div><div className="empty-text">No alerts</div></div>
      ) : (
        alerts.map((a) => (
          <div key={a.id} className="alert-item">
            <div className="alert-header">
              <span className={`severity-badge ${a.severity}`} />
              <span className="flight-id">{a.flightId}</span>
              <span className="alert-time">{timeAgo(a.timestamp)}</span>
            </div>
            <div className="alert-msg">{a.message}</div>
          </div>
        ))
      )}
    </div>
  );
}
