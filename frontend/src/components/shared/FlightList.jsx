import { motion } from 'motion/react';

const STATUS_COLORS = {
  LIVE: '#00D4FF',
  LANDED: '#555555',
  DELAYED: '#FF4444',
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

const GRID_COLUMNS = '120px 1fr 140px 100px 100px';

const cellStyle = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '13px',
  fontWeight: 400,
  color: '#F5F5F5',
  padding: '12px 16px',
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
};

const headerCellStyle = {
  fontFamily: '"Space Grotesk", sans-serif',
  fontWeight: 400,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: '#555',
  padding: '10px 16px',
  lineHeight: 1,
};

function StatusBadge({ status }) {
  const normalized = status?.toUpperCase() || 'LIVE';
  const color = STATUS_COLORS[normalized] || '#555555';

  return (
    <span
      style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '11px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: color,
        border: `1px solid ${color}`,
        borderRadius: '2px',
        padding: '3px 8px',
        lineHeight: 1,
      }}
    >
      {normalized}
    </span>
  );
}

function FlightRow({ flight }) {
  return (
    <motion.div
      variants={rowVariants}
      style={{
        display: 'grid',
        gridTemplateColumns: GRID_COLUMNS,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        cursor: 'default',
        borderLeft: '2px solid transparent',
        transition: 'background 0.15s ease, border-color 0.15s ease',
      }}
      whileHover={{
        backgroundColor: 'rgba(0,212,255,0.04)',
        borderLeftColor: '#00D4FF',
      }}
    >
      <div style={cellStyle}>{flight.flightNumber}</div>
      <div style={cellStyle}>
        <span style={{ color: '#888888' }}>{flight.origin}</span>
        <span
          style={{
            margin: '0 8px',
            color: '#333',
            fontFamily: '"Space Grotesk", sans-serif',
          }}
        >
          →
        </span>
        <span style={{ color: '#F5F5F5' }}>{flight.destination}</span>
      </div>
      <div style={cellStyle}>
        <span style={{ color: '#888888' }}>{flight.aircraftType}</span>
      </div>
      <div style={cellStyle}>
        {flight.delayMinutes > 0 ? (
          <span style={{ color: '#FF4444' }}>+{flight.delayMinutes}m</span>
        ) : (
          <span style={{ color: '#555' }}>—</span>
        )}
      </div>
      <div style={{ ...cellStyle, justifyContent: 'flex-end' }}>
        <StatusBadge status={flight.status} />
      </div>
    </motion.div>
  );
}

/**
 * Monospace flight table with staggered entrance animation.
 * @param {{ flights: Array<{ id: string, flightNumber: string, origin: string, destination: string, aircraftType: string, delayMinutes: number, status: string }> }} props
 */
export function FlightList({ flights }) {
  return (
    <div
      style={{
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '0px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID_COLUMNS,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={headerCellStyle}>Flight</div>
        <div style={headerCellStyle}>Route</div>
        <div style={headerCellStyle}>Aircraft</div>
        <div style={headerCellStyle}>Delay</div>
        <div style={{ ...headerCellStyle, textAlign: 'right' }}>Status</div>
      </div>

      {/* Rows */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {flights.map((flight) => (
          <FlightRow key={flight.id} flight={flight} />
        ))}
      </motion.div>
    </div>
  );
}
