import { useEffect, useRef, useMemo, useCallback } from 'react';

const STATUS_COLORS = {
  'on-time': '#00D4FF',
  'en-route': '#00D4FF',
  'scheduled': '#00D4FF',
  'landed': '#00D4FF',
  'delayed': '#FFB020',
  'critical': '#FF4444',
  'cancelled': '#FF4444',
  'grounded': '#FF4444',
};

const SECTION_HEADER = {
  fontFamily: '"Space Grotesk", system-ui, sans-serif',
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#888',
  marginBottom: '8px',
};

const BACKDROP_STYLE = {
  position: 'fixed',
  inset: 0,
  zIndex: 9998,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
};

const DRAWER_BASE = {
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: '320px',
  zIndex: 9999,
  backgroundColor: '#0A0A0A',
  borderLeft: '3px solid #00D4FF',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.6)',
  transition: 'transform 250ms ease-out',
};

const CLOSE_BTN = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '4px',
  color: '#888',
  cursor: 'pointer',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '14px',
  lineHeight: 1,
  padding: 0,
  transition: 'color 0.15s ease-out, background 0.15s ease-out',
};

function getStatusColor(status) {
  if (!status) return '#555';
  const key = status.toLowerCase().replace(/\s+/g, '-');
  return STATUS_COLORS[key] || '#555';
}

function normalizeStatus(status) {
  if (!status) return 'unknown';
  return status.toLowerCase().replace(/\s+/g, '-');
}

export default function AirportDrawer({ airport, flights = [], alerts = [], onClose }) {
  const drawerRef = useRef(null);
  const isOpen = airport != null;

  // Esc key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Derived: flights at this airport
  const airportFlights = useMemo(() => {
    if (!airport) return [];
    const iata = airport.iata?.toUpperCase();
    if (!iata) return [];
    return flights.filter((f) => {
      const origin = (f.origin || f.from || f.departure || '').toUpperCase();
      const dest = (f.destination || f.to || f.arrival || '').toUpperCase();
      return origin === iata || dest === iata;
    });
  }, [airport, flights]);

  // Derived: departures / arrivals counts
  const { departures, arrivals } = useMemo(() => {
    if (!airport) return { departures: 0, arrivals: 0 };
    const iata = airport.iata?.toUpperCase();
    let dep = 0;
    let arr = 0;
    airportFlights.forEach((f) => {
      const origin = (f.origin || f.from || f.departure || '').toUpperCase();
      const dest = (f.destination || f.to || f.arrival || '').toUpperCase();
      if (origin === iata) dep++;
      if (dest === iata) arr++;
    });
    return { departures: dep, arrivals: arr };
  }, [airport, airportFlights]);

  // Derived: alerts related to this airport
  const airportAlerts = useMemo(() => {
    if (!airport) return [];
    const iata = airport.iata?.toUpperCase();
    if (!iata) return [];

    // Get flight IDs at this airport for cross-referencing
    const flightIds = new Set(airportFlights.map((f) => f.id || f.flightId));

    return alerts.filter((a) => {
      // Direct airport match in alert message
      if (a.message?.toUpperCase().includes(iata)) return true;
      // Alert references a flight at this airport
      const alertFlightId = a.flightId || a.flight;
      if (alertFlightId && flightIds.has(alertFlightId)) return true;
      // Airport field on alert itself
      if ((a.airport || '').toUpperCase() === iata) return true;
      return false;
    });
  }, [airport, alerts, airportFlights]);

  const handleBackdropClick = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Don't render anything if no airport ever
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={BACKDROP_STYLE}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label={`Airport details for ${airport.iata}`}
        style={{
          ...DRAWER_BASE,
          transform: isOpen ? 'translateX(0)' : 'translateX(320px)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={CLOSE_BTN}
          aria-label="Close drawer"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#F5F5F5';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#888';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          {/* IATA code */}
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '32px',
            fontWeight: 700,
            color: '#00D4FF',
            lineHeight: 1,
            letterSpacing: '0.04em',
          }}>
            {airport.iata}
          </div>

          {/* Airport name */}
          <div style={{
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: '#F5F5F5',
            marginTop: '6px',
            lineHeight: 1.3,
          }}>
            {airport.name}
          </div>

          {/* City */}
          <div style={{
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            fontSize: '12px',
            color: '#888',
            marginTop: '2px',
          }}>
            {airport.city}
          </div>
        </div>

        {/* Stats section */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <div style={SECTION_HEADER}>Traffic</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <StatBox label="DEP" value={departures} color="#00D4FF" />
            <StatBox label="ARR" value={arrivals} color="#00D4FF" />
            <StatBox label="TOTAL" value={departures + arrivals} color="#F5F5F5" />
          </div>
        </div>

        {/* Alerts section */}
        {airportAlerts.length > 0 && (
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            <div style={SECTION_HEADER}>
              Alerts
              <span style={{
                marginLeft: '6px',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '10px',
                color: '#FF4444',
                fontWeight: 700,
              }}>
                {airportAlerts.length}
              </span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '120px',
              overflowY: 'auto',
            }}>
              {airportAlerts.map((a, idx) => (
                <AlertRow key={a.id || idx} alert={a} />
              ))}
            </div>
          </div>
        )}

        {/* Flight list */}
        <div style={{
          flex: 1,
          padding: '14px 20px',
          overflowY: 'auto',
          minHeight: 0,
        }}>
          <div style={SECTION_HEADER}>
            Flights
            <span style={{
              marginLeft: '6px',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '10px',
              color: '#888',
              fontWeight: 400,
            }}>
              {airportFlights.length}
            </span>
          </div>

          {airportFlights.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px 0',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              color: '#555',
            }}>
              NO ACTIVE FLIGHTS
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}>
              {airportFlights.map((f, idx) => (
                <FlightRow key={f.id || f.flightId || idx} flight={f} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}


/* ─── Sub-components ─── */

function StatBox({ label, value, color }) {
  return (
    <div style={{
      flex: 1,
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '4px',
      padding: '8px 10px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '20px',
        fontWeight: 700,
        color,
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '9px',
        color: '#888',
        marginTop: '4px',
        letterSpacing: '0.08em',
      }}>
        {label}
      </div>
    </div>
  );
}


function AlertRow({ alert }) {
  const sevColor = alert.severity === 'critical'
    ? '#FF4444'
    : alert.severity === 'warning'
      ? '#FFB020'
      : '#00D4FF';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      padding: '6px 8px',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '3px',
      borderLeft: `2px solid ${sevColor}`,
    }}>
      {/* Severity dot */}
      <div style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: sevColor,
        marginTop: '4px',
        flexShrink: 0,
      }} />
      <div style={{
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '11px',
        color: '#ccc',
        lineHeight: 1.4,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {alert.message}
      </div>
    </div>
  );
}


function FlightRow({ flight }) {
  const id = flight.id || flight.flightId || '—';
  const origin = flight.origin || flight.from || flight.departure || '???';
  const dest = flight.destination || flight.to || flight.arrival || '???';
  const status = normalizeStatus(flight.status);
  const dotColor = getStatusColor(flight.status);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 8px',
        borderRadius: '3px',
        transition: 'background 0.12s ease-out',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Flight ID */}
      <span style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '11px',
        fontWeight: 500,
        color: '#F5F5F5',
        width: '72px',
        flexShrink: 0,
      }}>
        {id}
      </span>

      {/* Route */}
      <span style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '11px',
        color: '#888',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {origin.toUpperCase()}
        <span style={{ color: '#555', margin: '0 3px' }}>→</span>
        {dest.toUpperCase()}
      </span>

      {/* Status dot */}
      <div
        title={status}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          flexShrink: 0,
          boxShadow: `0 0 6px ${dotColor}40`,
        }}
      />
    </div>
  );
}
