import { useState, useEffect } from 'react';
import { useSocket } from '../../providers/SocketProvider.jsx';
import { AlertTriangle, ShieldAlert, Users, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const DISRUPTION_TYPES = [
  { value: 'weather', label: 'Weather Event', icon: '⛈️' },
  { value: 'technical', label: 'Technical Failure', icon: '🔧' },
  { value: 'security', label: 'Security Breach', icon: '🛡️' },
  { value: 'atc', label: 'ATC Restriction', icon: '📡' },
  { value: 'medical', label: 'Medical Emergency', icon: '🚑' },
];

const AIRPORTS = ['JFK', 'EWR', 'LHR', 'CDG', 'DXB'];

export default function DisruptionSim() {
  const { socket } = useSocket();
  const [type, setType] = useState('weather');
  const [airport, setAirport] = useState('JFK');
  const [severity, setSeverity] = useState(5);
  const [cascade, setCascade] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const onCascade = (data) => {
      setCascade(data);
    };
    socket.on('disruption:cascade', onCascade);
    return () => socket.off('disruption:cascade', onCascade);
  }, [socket]);

  const handleInject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/disruptions/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          airport,
          severity,
          description: `${type.toUpperCase()} alert at ${airport}`,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      console.log('[Disruption] Simulated:', data);
    } catch (err) {
      console.error('[Disruption] Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

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
      {/* Left Column: Form & Cascade List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minWidth: 0 }}>
        {/* Simulator controls */}
        <div style={{
          background: 'var(--c-bg-secondary)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--r-lg)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, borderBottom: '1px solid var(--c-border)', paddingBottom: 'var(--space-2)' }}>
            DISRUPTION INJECTOR
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--c-muted)', textTransform: 'uppercase' }}>EVENT TYPE</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  background: 'var(--c-bg-tertiary)',
                  color: 'var(--c-cream)',
                  border: '1px solid var(--c-border-hi)',
                  borderRadius: 'var(--r-md)',
                  padding: '6px 12px',
                  fontSize: 'var(--text-xs)',
                  outline: 'none',
                }}
              >
                {DISRUPTION_TYPES.map(d => (
                  <option key={d.value} value={d.value}>{d.icon} {d.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--c-muted)', textTransform: 'uppercase' }}>AIRPORT HUB</label>
              <select
                value={airport}
                onChange={(e) => setAirport(e.target.value)}
                style={{
                  background: 'var(--c-bg-tertiary)',
                  color: 'var(--c-cream)',
                  border: '1px solid var(--c-border-hi)',
                  borderRadius: 'var(--r-md)',
                  padding: '6px 12px',
                  fontSize: 'var(--text-xs)',
                  outline: 'none',
                }}
              >
                {AIRPORTS.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--c-muted)', textTransform: 'uppercase' }}>
              <span>SEVERITY INDEX</span>
              <span style={{ color: 'var(--c-amber)' }}>{severity} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              style={{ accentColor: 'var(--c-sky)' }}
            />
          </div>

          <button
            onClick={handleInject}
            disabled={loading}
            style={{
              background: 'var(--c-red)',
              color: 'var(--c-cream)',
              border: 'none',
              borderRadius: 'var(--r-md)',
              padding: '10px 16px',
              fontFamily: 'var(--font-data)',
              fontSize: 'var(--text-xs)',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              textTransform: 'uppercase',
              marginTop: 'var(--space-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              transition: 'background var(--dur-fast) var(--ease-out)',
            }}
          >
            <AlertTriangle size={14} />
            {loading ? 'SIMULATING CASCADE...' : 'INJECT DISRUPTION'}
          </button>
        </div>

        {/* Live Cascade results */}
        <div style={{
          background: 'var(--c-bg-secondary)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--r-lg)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          flex: 1,
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, borderBottom: '1px solid var(--c-border)', paddingBottom: 'var(--space-2)' }}>
            CASCADE IMPACT LIST
          </h3>
          {cascade ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', overflowY: 'auto' }}>
              {cascade.affectedFlights.map(fid => (
                <div
                  key={fid}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--c-bg-tertiary)',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--c-border)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)', color: 'var(--c-sky)' }}>
                    {fid}
                  </span>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-xs)', color: 'var(--c-red)' }}>
                    +{cascade.severity * 8} mins delay
                  </span>
                </div>
              ))}
              {cascade.affectedFlights.length === 0 && (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--c-muted)', textAlign: 'center', padding: 'var(--space-4)' }}>
                  No active flights affected by this disruption.
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--c-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
              Inject a disruption event to view live cascading delay logs.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Statistics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{
          background: 'var(--c-bg-secondary)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--r-lg)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, borderBottom: '1px solid var(--c-border)', paddingBottom: 'var(--space-2)' }}>
            SIMULATED IMPACT SUMMARY
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <ShieldAlert size={20} color="var(--c-red)" />
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-muted)' }}>TOTAL DELAY ADDED</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, fontFamily: 'var(--font-data)' }}>
                  {cascade ? `${cascade.totalDelay} mins` : '0 mins'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Users size={20} color="var(--c-sky)" />
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-muted)' }}>AFFECTED FLIGHTS COUNT</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, fontFamily: 'var(--font-data)' }}>
                  {cascade ? cascade.affectedFlights.length : '0'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <TrendingUp size={20} color="var(--c-amber)" />
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-muted)' }}>ESTIMATED CASCADE SEVERITY</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, fontFamily: 'var(--font-data)' }}>
                  {cascade ? `${cascade.severity} / 10` : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
