import { useState, useMemo } from 'react';
import useFlightData from '../../hooks/useFlightData';

export default function CargoPanel() {
  const { cargoManifests, stats, overloadedFlights, revenueAtRisk } = useFlightData();
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!filter) return cargoManifests;
    const q = filter.toLowerCase();
    return cargoManifests.filter(
      (m) => m.flightId.toLowerCase().includes(q) || m.route.toLowerCase().includes(q) || m.type.toLowerCase().includes(q)
    );
  }, [cargoManifests, filter]);

  const routeOptimizations = useMemo(() => {
    const routes = {};
    cargoManifests.forEach((m) => {
      const key = m.route;
      if (!routes[key]) routes[key] = { route: key, current: 0, suggested: 0, count: 0 };
      routes[key].current += m.weight;
      routes[key].suggested += Math.round(m.weight * (0.8 + Math.random() * 0.15));
      routes[key].count++;
    });
    return Object.values(routes).slice(0, 8);
  }, [cargoManifests]);

  return (
    <div className="cargo-screen">
      <div className="cargo-metrics">
        <div className="metric-card">
          <div className="metric-label">Total Cargo</div>
          <div className="metric-value" style={{ color: 'var(--cyan)' }}>{stats.totalCargo}t</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Overloaded Flights</div>
          <div className="metric-value" style={{ color: 'var(--red)' }}>{overloadedFlights.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Revenue at Risk</div>
          <div className="metric-value" style={{ color: 'var(--amber)' }}>${(revenueAtRisk / 1000).toFixed(0)}K</div>
        </div>
      </div>

      <div className="cargo-table-container glass-panel" style={{ padding: 0 }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-glass)' }}>
          <input
            type="text" placeholder="Filter manifests..." value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', fontSize: 13, outline: 'none' }}
          />
        </div>
        <table className="cargo-table">
          <thead>
            <tr><th>Flight</th><th>Route</th><th>Weight</th><th>Type</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{m.flightId}</td>
                <td>{m.route}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{m.weight}t</td>
                <td>{m.type}</td>
                <td><span className={`status-badge ${m.status === 'loaded' ? 'on-time' : m.status === 'held' ? 'delayed' : 'in-flight'}`}>{m.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="utilization-bars glass-panel" style={{ padding: 16 }}>
        <div className="panel-section-header">📊 Capacity Utilization</div>
        {cargoManifests.slice(0, 12).map((m) => (
          <div key={m.id} className="util-row">
            <span className="util-label">{m.flightId}</span>
            <div className="util-bar-bg">
              <div className={`util-bar-fill ${m.utilization < 70 ? 'low' : m.utilization < 90 ? 'mid' : 'high'}`} style={{ width: `${m.utilization}%` }} />
            </div>
            <span className="util-pct">{m.utilization}%</span>
          </div>
        ))}
      </div>

      <div className="route-minimap glass-panel" style={{ padding: 16 }}>
        <div className="panel-section-header">🗺️ Route Optimization</div>
        {routeOptimizations.map((r, i) => (
          <div key={i} className="route-card">
            <div className="route-path">{r.route}</div>
            <div className="route-comparison">
              <span className="route-current">Current: {r.current}t</span>
              <span>→</span>
              <span className="route-suggested">Optimized: {r.suggested}t</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
