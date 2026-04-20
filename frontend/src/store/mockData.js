// ============================================
// AeroSync — Realistic Mock Data
// ============================================

export const AIRPORTS = {
  JFK: { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', lat: 40.6413, lng: -73.7781 },
  LHR: { code: 'LHR', name: 'Heathrow', city: 'London', lat: 51.4700, lng: -0.4543 },
  DXB: { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', lat: 25.2532, lng: 55.3657 },
  SIN: { code: 'SIN', name: 'Changi', city: 'Singapore', lat: 1.3644, lng: 103.9915 },
  LAX: { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', lat: 33.9425, lng: -118.4081 },
};

export const AIRCRAFT_TYPES = ['B777-300ER', 'A380-800', 'B787-9', 'A350-900', 'B747-8F'];

const statuses = ['on-time', 'delayed', 'cancelled', 'boarding', 'in-flight', 'landed'];
const statusWeights = [0.45, 0.2, 0.05, 0.1, 0.15, 0.05];

function weightedRandom(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFlightId(index) {
  const airlines = ['AS', 'AE', 'SY', 'NC'];
  return `${airlines[index % airlines.length]}${String(1000 + index).slice(1)}`;
}

function generateETA() {
  const now = new Date();
  const hours = randomBetween(1, 12);
  return new Date(now.getTime() + hours * 3600000).toISOString();
}

const airportCodes = Object.keys(AIRPORTS);

export function generateFlights(count = 25) {
  const flights = [];
  for (let i = 0; i < count; i++) {
    const originIdx = i % airportCodes.length;
    let destIdx = (originIdx + randomBetween(1, 4)) % airportCodes.length;
    const origin = airportCodes[originIdx];
    const dest = airportCodes[destIdx];
    const status = weightedRandom(statuses, statusWeights);
    const aircraft = AIRCRAFT_TYPES[i % AIRCRAFT_TYPES.length];
    const tailNumber = `N${randomBetween(100, 999)}${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 3) % 26))}`;
    const cargoWeight = randomBetween(2, 45);
    const maxCargo = randomBetween(50, 80);
    const delay = status === 'delayed' ? randomBetween(15, 180) : 0;
    const passengers = randomBetween(120, 450);

    flights.push({
      id: generateFlightId(i),
      origin,
      destination: dest,
      originData: AIRPORTS[origin],
      destinationData: AIRPORTS[dest],
      status,
      aircraft,
      tailNumber,
      cargoWeight,
      maxCargo,
      cargoUtilization: Math.round((cargoWeight / maxCargo) * 100),
      passengers,
      delay,
      eta: generateETA(),
      departureTime: new Date(Date.now() - randomBetween(0, 8) * 3600000).toISOString(),
      scheduledDeparture: new Date(Date.now() + randomBetween(-2, 10) * 3600000).toISOString(),
      scheduledArrival: new Date(Date.now() + randomBetween(2, 14) * 3600000).toISOString(),
      gate: `${String.fromCharCode(65 + randomBetween(0, 5))}${randomBetween(1, 40)}`,
      progress: status === 'in-flight' ? randomBetween(10, 90) : status === 'landed' ? 100 : 0,
    });
  }
  return flights;
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
      title: 'Reschedule AS000 to avoid storm zone',
      description: 'Divert via southern corridor to avoid tropical storm HELENE. Adds 45 min but eliminates turbulence risk.',
      confidence: 92,
      impact: '+45 min, -$2,300 fuel',
      affectedFlights: ['AS000'],
    },
    {
      id: 'ai-2',
      type: 'swap',
      title: 'Swap aircraft AS001 ↔ AE002',
      description: 'B777-300ER on AS001 route has excess capacity. Swap with A350-900 on AE002 to optimize fuel burn.',
      confidence: 87,
      impact: '-$4,100 fuel savings',
      affectedFlights: ['AS001', 'AE002'],
    },
    {
      id: 'ai-3',
      type: 'consolidate',
      title: 'Consolidate cargo SY003 + NC004',
      description: 'Both flights to DXB are under 40% cargo. Consolidate into single load on SY003 to free NC004 for maintenance window.',
      confidence: 78,
      impact: '+$12,500 revenue optimization',
      affectedFlights: ['SY003', 'NC004'],
    },
    {
      id: 'ai-4',
      type: 'reroute',
      title: 'Optimize LHR→SIN routing',
      description: 'Jetstream analysis shows 15kt tailwind on alternate FL380 route. Saves 22 minutes and 800kg fuel.',
      confidence: 94,
      impact: '-22 min, -$1,900 fuel',
      affectedFlights: ['AE006'],
    },
    {
      id: 'ai-5',
      type: 'delay',
      title: 'Strategic delay AS008 by 30 min',
      description: 'Connecting passengers from delayed LHR arrival. Holding 30 min prevents 47 passenger rebookings ($18,000).',
      confidence: 81,
      impact: '+30 min, saves $18,000',
      affectedFlights: ['AS008'],
    },
  ];
}

export const STORM_ZONES = [
  { id: 'storm-1', center: [30, -60], radius: 8, severity: 'severe', name: 'Tropical Storm HELENE' },
  { id: 'storm-2', center: [15, 75], radius: 5, severity: 'moderate', name: 'Monsoon Band' },
  { id: 'storm-3', center: [55, 10], radius: 4, severity: 'light', name: 'North Sea Low' },
];

export const DISRUPTION_TYPES = [
  { value: 'weather', label: 'Weather Event', icon: '🌪️' },
  { value: 'technical', label: 'Technical Failure', icon: '⚙️' },
  { value: 'security', label: 'Security Incident', icon: '🛡️' },
];
