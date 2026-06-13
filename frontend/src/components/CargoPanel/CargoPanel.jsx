import { useState, useEffect, useMemo } from 'react';
import { Package, ShieldAlert, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function CargoPanel() {
  const [cargoList, setCargoList] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/cargo`).then(r => r.json()),
      fetch(`${API_URL}/api/flights`).then(r => r.json())
    ]).then(([cargoData, flightsData]) => {
      setCargoList(cargoData.cargo || []);
      setFlights(flightsData.flights || []);
      setLoading(false);
    }).catch(err => {
      console.error('[Cargo] Fetch error:', err);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!filter) return cargoList;
    const q = filter.toLowerCase();
    return cargoList.filter(
      (m) => m.flightId.toLowerCase().includes(q) || m.manifestNumber.toLowerCase().includes(q) || m.priority.toLowerCase().includes(q)
    );
  }, [cargoList, filter]);

  const stats = useMemo(() => {
    const total = cargoList.reduce((sum, c) => sum + c.weightKg, 0) / 1000;
    const overloaded = cargoList.filter(c => (c.weightKg / c.capacityKg) > 0.9).length;
    const risk = cargoList.filter(c => c.status === 'damaged' || c.status === 'overweight').length;
    return { total: total.toFixed(1), overloaded, risk };
  }, [cargoList]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--c-muted)', fontFamily: 'var(--font-data)' }}>
        RECEIVING CARGO MANIFESTS...
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      height: '100%',
      background: 'var(--c-bg-primary)',
      padding: 'var(--space-4)',
      gap: 'var(--space-4)',
      overflowY: 'auto',
    }}>
      {/* Left Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minWidth: 0 }}>
        {/* Metric strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
          <div style={{ background: 'var(--c-bg-secondary)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', padding: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--c-sky)' }}>
              <Package size={16} />
              <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cargo Loaded</span>
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-data)', marginTop: 4 }}>
              {stats.total} Tons
            </div>
          </div>
          <div style={{ background: 'var(--c-bg-secondary)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', padding: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--c-amber)' }}>
              <ShieldAlert size={16} />
              <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overloaded Flights</span>
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-data)', marginTop: 4, color: 'var(--c-amber)' }}>
              {stats.overloaded}
            </div>
          </div>
          <div style={{ background: 'var(--c-bg-secondary)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', padding: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--c-red)' }}>
              <TrendingUp size={16} />
              <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alert Manifests</span>
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-data)', marginTop: 4, color: 'var(--c-red)' }}>
              {stats.risk}
            </div>
          </div>
        </div>

        {/* Cargo manifest table */}
        <div style={{ background: 'var(--c-bg-secondary)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-tertiary)' }}>
            <input
              type="text"
              placeholder="Search manifests by flight, manifest number, or priority..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--c-bg-primary)',
                border: '1px solid var(--c-border-hi)',
                borderRadius: 'var(--r-md)',
                color: 'var(--c-cream)',
                padding: '6px 12px',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr style={{ background: 'var(--c-bg-tertiary)', borderBottom: '1px solid var(--c-border)', color: 'var(--c-muted)', fontFamily: 'var(--font-data)' }}>
                  <th style={{ padding: '10px 12px' }}>MANIFEST</th>
                  <th style={{ padding: '10px 12px' }}>FLIGHT</th>
                  <th style={{ padding: '10px 12px' }}>WEIGHT</th>
                  <th style={{ padding: '10px 12px' }}>PRIORITY</th>
                  <th style={{ padding: '10px 12px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const util = Math.round((m.weightKg / m.capacityKg) * 100);
                  const isHigh = util > 90;
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--c-border)', background: 'transparent' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-data)', color: 'var(--c-cream)' }}>{m.manifestNumber}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-data)', color: 'var(--c-sky)' }}>{m.flightId}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-data)' }}>
                        {m.weightKg.toLocaleString()} / {m.capacityKg.toLocaleString()} kg ({util}%)
                      </td>
                      <td style={{ padding: '10px 12px', textTransform: 'uppercase', color: m.priority === 'express' ? 'var(--c-red)' : m.priority === 'priority' ? 'var(--c-amber)' : 'var(--c-cream)' }}>{m.priority}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          background: m.status === 'loaded' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: m.status === 'loaded' ? 'var(--c-green)' : 'var(--c-red)',
                          border: `1px solid ${m.status === 'loaded' ? 'var(--c-green)' : 'var(--c-red)'}22`,
                          padding: '2px 6px',
                          borderRadius: 'var(--r-sm)',
                          textTransform: 'uppercase',
                        }}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Capacity utilization overlay */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ background: 'var(--c-bg-secondary)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, borderBottom: '1px solid var(--c-border)', paddingBottom: 'var(--space-2)' }}>
            CAPACITY UTILIZATION
          </h3>
          {cargoList.map(c => {
            const util = Math.round((c.weightKg / c.capacityKg) * 100);
            return (
              <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-data)' }}>
                  <span>{c.flightId} ({c.manifestNumber})</span>
                  <span>{util}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--c-bg-panel)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${util}%`,
                    background: util > 90 ? 'var(--c-red)' : util > 70 ? 'var(--c-amber)' : 'var(--c-green)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
