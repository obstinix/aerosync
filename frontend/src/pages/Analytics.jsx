import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import useFlightData from '../hooks/useFlightData.js';

// Heuristic: Generate mock history if localStorage is empty
const getMockHistory = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    const hourStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    data.push({
      time: hourStr,
      JFK: Math.floor(15 + Math.sin(i * 0.5) * 10 + Math.random() * 5),
      LHR: Math.floor(12 + Math.cos(i * 0.4) * 8 + Math.random() * 4),
      DXB: Math.floor(8 + Math.sin(i * 0.3) * 6 + Math.random() * 3),
      LAX: Math.floor(20 + Math.cos(i * 0.6) * 12 + Math.random() * 6),
      CDG: Math.floor(10 + Math.sin(i * 0.2) * 5 + Math.random() * 4),
    });
  }
  return data;
};

const radarData = [
  { subject: 'On-Time %', JFK: 85, LHR: 78, DXB: 92, CDG: 80, LAX: 88 },
  { subject: 'Cargo Util %', JFK: 72, LHR: 88, DXB: 90, CDG: 65, LAX: 74 },
  { subject: 'Recovery Speed', JFK: 60, LHR: 70, DXB: 85, CDG: 55, LAX: 68 },
  { subject: 'AI Accuracy', JFK: 94, LHR: 90, DXB: 88, CDG: 92, LAX: 95 },
  { subject: 'Slot Efficiency', JFK: 78, LHR: 65, DXB: 80, CDG: 70, LAX: 82 },
];

export default function AnalyticsPage() {
  const { flights } = useFlightData();

  // Compute live delay count by origin airport
  const delayByOrigin = useMemo(() => {
    const map = {};
    if (flights) {
      flights.forEach((f) => {
        if (f.status === 'delayed' || f.status === 'critical') {
          map[f.origin] = (map[f.origin] || 0) + 1;
        } else {
          map[f.origin] = map[f.origin] || 0;
        }
      });
    }
    // Ensure all hubs have entries
    ['JFK', 'LHR', 'DXB', 'LAX', 'CDG', 'EWR', 'ORD', 'NRT', 'SIN'].forEach((hub) => {
      if (map[hub] === undefined) map[hub] = 0;
    });
    return Object.entries(map).map(([name, delays]) => ({ name, delays }));
  }, [flights]);

  const historyData = useMemo(() => {
    const stored = localStorage.getItem('aerosync_predictions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 5) {
          // Map stored local prediction timestamps to hourly slots
          return parsed.slice(-24).map((p, idx) => ({
            time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            JFK: p.predictedDelay || 15,
            LHR: p.predictedDelay * 0.8 || 12,
            DXB: p.predictedDelay * 0.5 || 8,
            LAX: p.predictedDelay * 1.1 || 20,
            CDG: p.predictedDelay * 0.7 || 10,
          }));
        }
      } catch (e) {
        console.error('Error parsing stored history', e);
      }
    }
    return getMockHistory();
  }, []);

  return (
    <div
      style={{
        padding: '24px',
        background: '#000000',
        color: '#F5F5F5',
        height: '100%',
        overflowY: 'auto',
        fontFamily: '"Space Grotesk", sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <h2
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: '14px',
          fontWeight: 700,
          color: '#F5F5F5',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '8px',
        }}
      >
        HISTORICAL OPERATIONS & DELAY ANALYTICS
      </h2>

      {/* Grid Layout for Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Line Chart: Delay Trend */}
        <div
          style={{
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '20px',
            borderRadius: '4px',
          }}
        >
          <h3
            style={{
              fontSize: '12px',
              color: '#888888',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            24h Average Hub Delay Trend (Minutes)
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  stroke="#555"
                  tick={{ fontFamily: 'JetBrains Mono', fontSize: '9px' }}
                />
                <YAxis stroke="#555" tick={{ fontFamily: 'JetBrains Mono', fontSize: '9px' }} />
                <Tooltip
                  contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)' }}
                  labelStyle={{ fontFamily: 'JetBrains Mono', color: '#00D4FF', fontSize: '10px' }}
                  itemStyle={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'Space Grotesk' }} />
                <Line type="monotone" dataKey="JFK" stroke="#00D4FF" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="LHR" stroke="#FF4444" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="DXB" stroke="#FFB800" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="LAX" stroke="#A855F7" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Delay Count by Hub */}
        <div
          style={{
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '20px',
            borderRadius: '4px',
          }}
        >
          <h3
            style={{
              fontSize: '12px',
              color: '#888888',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Live Delay Count by Airport Hub
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayByOrigin}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke="#555"
                  tick={{ fontFamily: 'JetBrains Mono', fontSize: '9px' }}
                />
                <YAxis stroke="#555" tick={{ fontFamily: 'JetBrains Mono', fontSize: '9px' }} />
                <Tooltip
                  contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)' }}
                  labelStyle={{ fontFamily: 'JetBrains Mono', color: '#00D4FF', fontSize: '10px' }}
                  itemStyle={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#fff' }}
                />
                <Bar dataKey="delays" fill="#00D4FF" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart: Hub Multi-Dimensional Performance */}
        <div
          style={{
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '20px',
            borderRadius: '4px',
          }}
        >
          <h3
            style={{
              fontSize: '12px',
              color: '#888888',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Hub Performance Matrix (Normalized)
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.04)" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#888"
                  tick={{ fontFamily: 'Space Grotesk', fontSize: '10px' }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#444" tick={false} />
                <Tooltip
                  contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)' }}
                  labelStyle={{ fontFamily: 'JetBrains Mono', color: '#00D4FF', fontSize: '10px' }}
                  itemStyle={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'Space Grotesk' }} />
                <Radar name="JFK" dataKey="JFK" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.1} />
                <Radar name="LHR" dataKey="LHR" stroke="#FF4444" fill="#FF4444" fillOpacity={0.1} />
                <Radar name="DXB" dataKey="DXB" stroke="#FFB800" fill="#FFB800" fillOpacity={0.1} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
