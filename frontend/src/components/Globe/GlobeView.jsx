import { useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import useFlightData from '../../hooks/useFlightData.js';
import useStore from '../../store/useStore';
import { STORM_ZONES } from '../../store/mockData';

const AIRPORTS = {
  JFK: { code: 'JFK', lat: 40.6413, lng: -73.7781, city: 'New York' },
  LHR: { code: 'LHR', lat: 51.4700, lng: -0.4543, city: 'London' },
  DXB: { code: 'DXB', lat: 25.2532, lng: 55.3657, city: 'Dubai' },
  SIN: { code: 'SIN', lat: 1.3644, lng: 103.9915, city: 'Singapore' },
  LAX: { code: 'LAX', lat: 33.9416, lng: -118.4085, city: 'Los Angeles' },
  CDG: { code: 'CDG', lat: 49.0097, lng: 2.5479, city: 'Paris' },
  EWR: { code: 'EWR', lat: 40.6895, lng: -74.1745, city: 'Newark' },
  ORD: { code: 'ORD', lat: 41.9742, lng: -87.9073, city: 'Chicago' },
  NRT: { code: 'NRT', lat: 35.7767, lng: 140.3864, city: 'Tokyo' },
};

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

const ACCENT = '#00D4FF';

/**
 * Interpolate N points along a great-circle-ish path between two coords.
 * Gives a slight curve so arcs don't look like straight lines at low zoom.
 */
/**
 * Interpolate N points along a great-circle-ish path between two coords.
 * Gives a slight curve so arcs don't look like straight lines at low zoom.
 */
function arcPoints(lat1, lng1, lat2, lng2, segments = 32) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    pts.push([
      lat1 + (lat2 - lat1) * t,
      lng1 + (lng2 - lng1) * t,
    ]);
  }
  return pts;
}

function isFlightInStorm(pos, storms) {
  if (!pos || !storms || storms.length === 0) return false;
  const [lat, lon] = pos;
  return storms.some(storm => {
    const [slat, slng] = storm.center;
    const dist = Math.sqrt(Math.pow(lat - slat, 2) + Math.pow(lon - slng, 2));
    return dist <= storm.radius;
  });
}

export default function GlobeView() {
  const { flights } = useFlightData();
  const showWeather = useStore((s) => s.showWeather);
  const setSelectedFlight = useStore((s) => s.setSelectedFlight);

  /* ---- derived data ---- */
  const flightArcs = useMemo(() => {
    if (!flights) return [];
    return flights
      .map((flight) => {
        const o = AIRPORTS[flight.origin];
        const d = AIRPORTS[flight.destination];
        if (!o || !d) return null;
        const midpoint = [(o.lat + d.lat) / 2, (o.lng + d.lng) / 2];
        const currentPos = (flight.lat !== undefined && flight.lat !== null && flight.lon !== undefined && flight.lon !== null)
          ? [Number(flight.lat), Number(flight.lon)]
          : midpoint;
        return {
          flight,
          positions: arcPoints(o.lat, o.lng, d.lat, d.lng),
          midpoint,
          currentPos,
        };
      })
      .filter(Boolean);
  }, [flights]);

  const stormCircles = useMemo(() => {
    if (!showWeather) return [];
    return STORM_ZONES.map((s) => ({
      ...s,
      position: s.center,
      leafletRadius: s.radius * 80000,
    }));
  }, [showWeather]);

  return (
    <>
      {/* Pulse keyframes injected once */}
      <style>{`
        @keyframes aero-pulse {
          0%   { opacity: 1; transform: scale(1); }
          50%  { opacity: .5; transform: scale(1.6); }
          100% { opacity: 1; transform: scale(1); }
        }
        .leaflet-interactive.aero-pulse {
          animation: aero-pulse 2s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes storm-pulse {
          0% { stroke-width: 2px; stroke-opacity: 0.8; }
          100% { stroke-width: 16px; stroke-opacity: 0; }
        }
        .leaflet-interactive.storm-pulse-ring {
          animation: storm-pulse 1.8s cubic-bezier(0.24, 0, 0.38, 1) infinite;
          transform-origin: center;
        }
        /* Remove any default Leaflet chrome that breaks full-bleed */
        .leaflet-container {
          background: #000 !important;
        }
      `}</style>

      <MapContainer
        center={[30, 0]}
        zoom={2}
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: '#000' }}
        attributionControl={true}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

        {/* ---- Precipitation Radar Overlay ---- */}
        {showWeather && (
          <TileLayer
            url={
              import.meta.env.VITE_OPENWEATHER_API_KEY
                ? `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
                : 'https://tilecache.rainviewer.com/v2/radar/default/256/{z}/{x}/{y}/2/0_0.png'
            }
            opacity={0.45}
            zIndex={10}
          />
        )}

        {/* ---- Storm / weather zones ---- */}
        {stormCircles.map((storm) => {
          const color =
            storm.severity === 'severe'
              ? '#FF3D5A'
              : storm.severity === 'moderate'
                ? '#FFB800'
                : ACCENT;
          return (
            <CircleMarker
              key={storm.id}
              center={storm.position}
              radius={storm.radius * 6}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.18,
                weight: 1,
                opacity: 0.5,
              }}
            >
              <Popup>
                <span style={{ fontFamily: 'Space Grotesk', color: '#F5F5F5' }}>
                  <strong>{storm.name}</strong>
                  <br />
                  Severity: {storm.severity}
                </span>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* ---- Airport markers ---- */}
        {Object.values(AIRPORTS).map((ap) => (
          <CircleMarker
            key={ap.code}
            center={[ap.lat, ap.lng]}
            radius={7}
            pathOptions={{
              color: ACCENT,
              fillColor: ACCENT,
              fillOpacity: 0.85,
              weight: 1.5,
              opacity: 0.9,
            }}
          >
            <Popup>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12,
                  color: '#F5F5F5',
                }}
              >
                <strong>{ap.code}</strong> — {ap.city}
              </span>
            </Popup>
          </CircleMarker>
        ))}

        {/* ---- Flight arcs (polylines) ---- */}
        {flightArcs.map(({ flight, positions }) => {
          const statusColor =
            flight.status === 'delayed'
              ? '#FFB800'
              : flight.status === 'cancelled'
                ? '#FF3D5A'
                : ACCENT;
          return (
            <Polyline
              key={`arc-${flight.id}`}
              positions={positions}
              pathOptions={{
                color: statusColor,
                weight: 1.5,
                opacity: 0.4,
                dashArray: flight.status === 'cancelled' ? '6 4' : undefined,
              }}
            />
          );
        })}

        {/* ---- Flight dot markers ---- */}
        {flightArcs.map(({ flight, currentPos }) => {
          const inStorm = showWeather && isFlightInStorm(currentPos, STORM_ZONES);
          return (
            <span key={`dot-${flight.id}`}>
              {inStorm && (
                <CircleMarker
                  center={currentPos}
                  radius={12}
                  className="storm-pulse-ring"
                  pathOptions={{
                    color: '#FFB800',
                    fillColor: 'transparent',
                    weight: 2,
                    opacity: 0.85,
                  }}
                />
              )}
              <CircleMarker
                center={currentPos}
                radius={5}
                className="aero-pulse"
                pathOptions={{
                  color: inStorm ? '#FFB800' : ACCENT,
                  fillColor: inStorm ? '#FFB800' : ACCENT,
                  fillOpacity: 1,
                  weight: 0,
                }}
                eventHandlers={{
                  click: () => setSelectedFlight(flight),
                }}
              >
                <Popup>
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 11,
                      color: '#F5F5F5',
                    }}
                  >
                    <strong>{flight.id}</strong>
                    {inStorm && <span style={{ color: '#FFB800', marginLeft: 8 }}>⚠️ STORM WARNING</span>}
                    <br />
                    {flight.origin} → {flight.destination}
                    <br />
                    Status: {flight.status}
                    <br />
                    Position: {currentPos[0].toFixed(2)}N, {currentPos[1].toFixed(2)}E
                  </span>
                </Popup>
              </CircleMarker>
            </span>
          );
        })}
      </MapContainer>
    </>
  );
}
