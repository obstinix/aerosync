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
        return {
          flight,
          positions: arcPoints(o.lat, o.lng, d.lat, d.lng),
          midpoint: [(o.lat + d.lat) / 2, (o.lng + d.lng) / 2],
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
        {flightArcs.map(({ flight, midpoint }) => (
          <CircleMarker
            key={`dot-${flight.id}`}
            center={midpoint}
            radius={5}
            className="aero-pulse"
            pathOptions={{
              color: ACCENT,
              fillColor: ACCENT,
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
                <br />
                {flight.origin} → {flight.destination}
                <br />
                Status: {flight.status}
              </span>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </>
  );
}
