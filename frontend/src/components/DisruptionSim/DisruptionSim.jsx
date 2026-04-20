import { useState } from 'react';
import useStore from '../../store/useStore';
import { AIRPORTS, DISRUPTION_TYPES } from '../../store/mockData';

export default function DisruptionSim() {
  const [type, setType] = useState('weather');
  const [airport, setAirport] = useState('JFK');
  const [severity, setSeverity] = useState(5);
  const disruptions = useStore((s) => s.disruptions);
  const injectDisruption = useStore((s) => s.injectDisruption);

  const handleInject = () => {
    injectDisruption({ type, airport, severity: severity / 10 });
  };

  const latest = disruptions[0];

  return (
    <div className="disruption-screen">
      <div className="disruption-controls glass-panel" style={{ padding: 20 }}>
        <div className="panel-section-header">🎛️ Disruption Controls</div>

        <label>
          Event Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {DISRUPTION_TYPES.map((d) => (
              <option key={d.value} value={d.value}>{d.icon} {d.label}</option>
            ))}
          </select>
        </label>

        <label>
          Airport
          <select value={airport} onChange={(e) => setAirport(e.target.value)}>
            {Object.keys(AIRPORTS).map((code) => (
              <option key={code} value={code}>{code} — {AIRPORTS[code].city}</option>
            ))}
          </select>
        </label>

        <label>
          Severity: {severity}/10
          <input type="range" className="severity-slider" min="1" max="10" value={severity} onChange={(e) => setSeverity(Number(e.target.value))} />
        </label>

        <button className="inject-btn" onClick={handleInject}>
          ⚡ Inject Disruption
        </button>

        {disruptions.length > 0 && (
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
            {disruptions.length} disruption(s) simulated
          </div>
        )}
      </div>

      <div className="cascade-panel glass-panel" style={{ padding: 16 }}>
        <div className="panel-section-header">🔗 Cascade Impact</div>
        {!latest ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <div className="empty-text">Inject a disruption to see impact</div>
          </div>
        ) : (
          latest.affectedFlights.map((f, i) => (
            <div key={f.id + i} className="cascade-node" style={{ animationDelay: `${i * 0.08}s` }}>
              <div>
                <div className="cascade-flight">{f.id}</div>
                <div className="cascade-route">{f.origin} → {f.destination}</div>
              </div>
              <div className="cascade-delay">+{f.estimatedDelay} min</div>
            </div>
          ))
        )}
      </div>

      <div className="disruption-summary">
        <div className="summary-card">
          <div className="sum-label">Total Delays</div>
          <div className="sum-value" style={{ color: 'var(--amber)' }}>
            {latest ? `${latest.totalDelays} min` : '—'}
          </div>
        </div>
        <div className="summary-card">
          <div className="sum-label">Passengers Affected</div>
          <div className="sum-value" style={{ color: 'var(--cyan)' }}>
            {latest ? latest.passengersAffected.toLocaleString() : '—'}
          </div>
        </div>
        <div className="summary-card">
          <div className="sum-label">Revenue Impact</div>
          <div className="sum-value" style={{ color: 'var(--red)' }}>
            {latest ? `$${(latest.revenueImpact / 1000).toFixed(0)}K` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
