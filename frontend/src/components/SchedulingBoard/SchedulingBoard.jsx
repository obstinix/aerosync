import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import { AIRPORTS } from '../../store/mockData';

export default function SchedulingBoard() {
  const flights = useStore((s) => s.flights);
  const aiSuggestions = useStore((s) => s.aiSuggestions);
  const [hub, setHub] = useState('ALL');
  const [expandedAi, setExpandedAi] = useState(null);

  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  const filteredFlights = useMemo(() => {
    if (hub === 'ALL') return flights;
    return flights.filter((f) => f.origin === hub || f.destination === hub);
  }, [flights, hub]);

  const tailGroups = useMemo(() => {
    const groups = {};
    filteredFlights.forEach((f) => {
      if (!groups[f.tailNumber]) groups[f.tailNumber] = [];
      groups[f.tailNumber].push(f);
    });
    return groups;
  }, [filteredFlights]);

  function getBlockPosition(flight) {
    const dep = new Date(flight.scheduledDeparture);
    const arr = new Date(flight.scheduledArrival);
    const startHour = dep.getHours() + dep.getMinutes() / 60;
    const duration = (arr - dep) / 3600000;
    const left = (startHour / 24) * 100;
    const width = Math.max((duration / 24) * 100, 3);
    return { left: `${left}%`, width: `${width}%` };
  }

  return (
    <div className="scheduling-screen">
      <div className="schedule-toolbar">
        <select value={hub} onChange={(e) => setHub(e.target.value)}>
          <option value="ALL">All Hubs</option>
          {Object.keys(AIRPORTS).map((code) => (
            <option key={code} value={code}>{code} — {AIRPORTS[code].city}</option>
          ))}
        </select>
        <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
        <select defaultValue="all">
          <option value="all">All Aircraft</option>
          <option value="B777">B777-300ER</option>
          <option value="A380">A380-800</option>
          <option value="B787">B787-9</option>
          <option value="A350">A350-900</option>
        </select>
        <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
          {Object.keys(tailGroups).length} aircraft · {filteredFlights.length} flights
        </div>
      </div>

      <div className="schedule-body">
        <div className="gantt-panel glass-panel" style={{ padding: 0 }}>
          <div className="gantt-header">
            <div style={{ width: 100, padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>TAIL #</div>
            {hours.map((h) => <div key={h} className="time-col">{h}</div>)}
          </div>
          <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
            {Object.entries(tailGroups).map(([tail, tFlights]) => (
              <div key={tail} className="gantt-row">
                <div className="tail-label">{tail}</div>
                <div className="timeline">
                  {tFlights.map((f) => {
                    const pos = getBlockPosition(f);
                    return (
                      <div key={f.id} className={`flight-block ${f.status}`} style={pos} title={`${f.id}: ${f.origin}→${f.destination}`}>
                        <span>{f.id}</span>
                        <span style={{ fontSize: 9, opacity: 0.7 }}>{f.origin}→{f.destination}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-panel">
          <h3>🤖 AI Suggestions</h3>
          {aiSuggestions.map((s) => (
            <div key={s.id} className="ai-card">
              <div className="ai-title">{s.title}</div>
              <div className={`ai-desc ${expandedAi === s.id ? 'expanded' : ''}`}>{s.description}</div>
              <div className="confidence-bar">
                <div className="confidence-fill" style={{ width: `${s.confidence}%` }} />
              </div>
              <div className="ai-meta">
                <span className="ai-confidence">{s.confidence}%</span>
                <span className="ai-impact">{s.impact}</span>
                <button className="why-btn" onClick={() => setExpandedAi(expandedAi === s.id ? null : s.id)}>
                  {expandedAi === s.id ? 'Hide' : 'Why?'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
