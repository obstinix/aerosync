import { INDIAN_AIRPORTS, INDIAN_FLIGHTS } from '../data/indianFlights';

export const AIRPORTS = INDIAN_AIRPORTS.reduce((acc, airport) => {
  acc[airport.iata] = {
    code: airport.iata,
    name: airport.name,
    city: airport.city,
    lat: airport.lat,
    lng: airport.lon,
    hub: airport.hub || false
  };
  return acc;
}, {});

export const AIRCRAFT_TYPES = ['B777-300ER', 'A321', 'B737', 'B787-9', 'A320'];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateFlights(count = 25) {
  return INDIAN_FLIGHTS.map((f, i) => {
    const origin = f.origin;
    const dest = f.destination;
    const originData = AIRPORTS[origin];
    const destinationData = AIRPORTS[dest];
    const aircraft = f.airline === 'Air India' ? 'B777-300ER' : f.airline === 'IndiGo' ? 'A321' : f.airline === 'SpiceJet' ? 'B737' : 'A320';
    const tailNumber = f.airline === 'Air India' ? `VT-AL${i}` : f.airline === 'IndiGo' ? `VT-IF${i}` : f.airline === 'SpiceJet' ? `VT-SG${i}` : `VT-IX${i}`;
    const cargoWeight = Math.floor(Math.random() * 15) + 5;
    const maxCargo = 20;
    const delay = f.delay;
    const passengers = f.pax;
    const status = f.status;

    return {
      id: f.id,
      flightNumber: f.callsign,
      origin,
      destination: dest,
      originData,
      destinationData,
      status,
      aircraft,
      aircraftType: aircraft.split('-')[0],
      tailNumber,
      cargoWeight,
      maxCargo,
      cargoUtilization: Math.round((cargoWeight / maxCargo) * 100),
      cargoWeightKg: cargoWeight * 1000,
      passengers,
      delay,
      delayMinutes: delay,
      progressPct: status === 'on-time' ? 0 : status === 'delayed' ? 0.1 : status === 'critical' ? 0.3 : 0,
      eta: new Date(Date.now() + 2 * 3600000).toISOString(),
      departureTime: new Date(Date.now() - 30 * 60000).toISOString(),
      scheduledDeparture: new Date(Date.now() - 30 * 60000).toISOString(),
      scheduledArrival: new Date(Date.now() + 2 * 3600000).toISOString(),
      gate: `G${i+1}`,
      progress: status === 'on-time' ? 0 : status === 'delayed' ? 10 : status === 'critical' ? 30 : 0,
    };
  });
}

export function generateAlerts(flights) {
  const alertTypes = [
    { severity: 'critical', messages: ['Engine warning detected', 'Weather hold — severe turbulence', 'Runway closure — emergency landing'] },
    { severity: 'warning', messages: ['Departure delayed — crew scheduling', 'Cargo overweight — requires rebalance', 'ATC ground stop issued'] },
    { severity: 'nominal', messages: ['On-time departure confirmed', 'Cargo loaded successfully', 'Passenger boarding complete'] },
  ];

  return flights.slice(0, 12).map((flight, i) => {
    const type = alertTypes[i % 3];
    return {
      id: `ALT-${Date.now()}-${i}`,
      flightId: flight.id,
      severity: type.severity,
      message: type.messages[i % type.messages.length],
      timestamp: new Date(Date.now() - randomBetween(0, 3600) * 1000).toISOString(),
    };
  });
}

export function generateCargoManifests(flights) {
  const cargoTypes = ['General', 'Perishable', 'Hazardous', 'Pharmaceutical', 'Electronics', 'Livestock', 'Mail'];
  const manifestStatuses = ['loaded', 'pending', 'in-transit', 'delivered', 'held'];

  return flights.map((flight, i) => ({
    id: `CGO-${1000 + i}`,
    flightId: flight.id,
    route: `${flight.origin} → ${flight.destination}`,
    origin: flight.origin,
    destination: flight.destination,
    weight: flight.cargoWeight,
    maxWeight: flight.maxCargo,
    utilization: flight.cargoUtilization,
    type: cargoTypes[i % cargoTypes.length],
    status: manifestStatuses[i % manifestStatuses.length],
    revenue: randomBetween(5000, 150000),
    priority: randomBetween(1, 5),
  }));
}

export function generateAISuggestions() {
  return [
    {
      id: 'ai-1',
      type: 'reschedule',
      title: 'Reschedule AI-101 to avoid storm zone',
      description: 'Divert via southern corridor to avoid tropical storm HELENE. Adds 45 min but eliminates turbulence risk.',
      confidence: 92,
      impact: '+45 min, -$2,300 fuel',
      affectedFlights: ['AI-101'],
    },
    {
      id: 'ai-2',
      type: 'swap',
      title: 'Swap aircraft 6E-201 ↔ SG-301',
      description: 'A321 on 6E-201 route has excess capacity. Swap with B737 on SG-301 to optimize fuel burn.',
      confidence: 87,
      impact: '-$4,100 fuel savings',
      affectedFlights: ['6E-201', 'SG-301'],
    },
    {
      id: 'ai-3',
      type: 'consolidate',
      title: 'Consolidate cargo AI-202 + 6E-401',
      description: 'Both flights to DEL are under 40% cargo. Consolidate into single load on AI-202 to free 6E-401 for maintenance window.',
      confidence: 78,
      impact: '+$12,500 revenue optimization',
      affectedFlights: ['AI-202', '6E-401'],
    },
  ];
}

export const STORM_ZONES = [
  { id: 'storm-1', center: [20, 78], radius: 6, severity: 'severe', name: 'Monsoon Depression B1' },
  { id: 'storm-2', center: [15, 75], radius: 5, severity: 'moderate', name: 'Western Ghats Turb' },
  { id: 'storm-3', center: [22, 86], radius: 4, severity: 'light', name: 'Kolkata Squall' },
];

export const DISRUPTION_TYPES = [
  { value: 'weather', label: 'Weather Event', icon: '🌪️' },
  { value: 'technical', label: 'Technical Failure', icon: '⚙️' },
  { value: 'security', label: 'Security Incident', icon: '🛡️' },
];
