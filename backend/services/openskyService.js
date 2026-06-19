import cron from 'node-cron';

const AIRPORTS = {
  JFK: { lat: 40.6413, lng: -73.7781 },
  LHR: { lat: 51.4700, lng: -0.4543 },
  DXB: { lat: 25.2532, lng: 55.3657 },
  SIN: { lat: 1.3644, lng: 103.9915 },
  LAX: { lat: 33.9416, lng: -118.4085 },
  CDG: { lat: 49.0097, lng: 2.5479 },
  EWR: { lat: 40.6895, lng: -74.1745 },
  ORD: { lat: 41.9742, lng: -87.9073 },
  NRT: { lat: 35.7767, lng: 140.3864 },
};
const AIRPORT_KEYS = Object.keys(AIRPORTS);

let cachedFlights = [];
let lastFetch = 0;
const CACHE_TTL = 55000; // 55 seconds TTL

// Distance calculation
function getProgress(lat, lon, originKey, destKey) {
  const origin = AIRPORTS[originKey];
  const dest = AIRPORTS[destKey];
  if (!origin || !dest) return 0.5;
  const distOrigin = Math.sqrt(Math.pow(lat - origin.lat, 2) + Math.pow(lon - origin.lng, 2));
  const distDest = Math.sqrt(Math.pow(lat - dest.lat, 2) + Math.pow(lon - dest.lng, 2));
  const total = distOrigin + distDest;
  return total > 0 ? Math.min(1, Math.max(0, distOrigin / total)) : 0.5;
}

export async function fetchOpenSkyFlights() {
  const now = Date.now();
  if (now - lastFetch < CACHE_TTL && cachedFlights.length > 0) {
    return cachedFlights;
  }

  const username = process.env.OPENSKY_USERNAME;
  const password = process.env.OPENSKY_PASSWORD;
  
  // Transatlantic and domestic US/Europe bounding box
  const lamin = 15;
  const lomin = -125;
  const lamax = 65;
  const lomax = 35;
  const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

  const headers = {};
  if (username && password) {
    headers['Authorization'] = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
  }

  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      throw new Error(`OpenSky API responded with status ${res.status}`);
    }
    const data = await res.json();
    
    if (data && data.states) {
      // Filter: callsign not empty, not on ground, has lat/lon
      const activeStates = data.states.filter(
        (s) => s[1] && s[1].trim() && !s[8] && s[5] !== null && s[6] !== null
      );

      // Take at most 30 flights
      const sliced = activeStates.slice(0, 30);
      
      const mapped = sliced.map((s, idx) => {
        const rawCallsign = s[1].trim();
        // Format callsign as AA-102 or similar
        const letters = rawCallsign.replace(/[^a-zA-Z]/g, '').slice(0, 2) || 'AE';
        const numbers = rawCallsign.replace(/[^0-9]/g, '').slice(0, 3) || (100 + idx);
        const id = `${letters.toUpperCase()}-${numbers}`;

        // Assign mock origin/destination from our supported list
        const originKey = AIRPORT_KEYS[idx % AIRPORT_KEYS.length];
        const destKey = AIRPORT_KEYS[(idx + 3) % AIRPORT_KEYS.length];
        
        const lat = s[6];
        const lon = s[5];
        
        return {
          id,
          flightNumber: rawCallsign,
          origin: originKey,
          destination: destKey,
          lat,
          lon,
          altitude: s[7] || 10000,
          velocity: s[9] || 250,
          heading: s[10] || 0,
          status: 'in-flight',
          delayMinutes: Math.random() < 0.15 ? Math.floor(Math.random() * 45) + 5 : 0,
          progressPct: getProgress(lat, lon, originKey, destKey),
          aircraftType: 'B787',
          gate: `G${idx + 1}`,
          cargoWeightKg: Math.floor(Math.random() * 15000) + 5000,
        };
      });

      cachedFlights = mapped;
      lastFetch = now;
      console.log(`[OpenSky] Successfully cached ${mapped.length} active flights.`);
      return mapped;
    }
  } catch (err) {
    console.warn(`[OpenSky] Fetch failed: ${err.message}. Retaining cache.`);
  }

  // Fallback / Generator if cache is empty
  if (cachedFlights.length === 0) {
    console.log('[OpenSky] Cache empty, generating mock active flights.');
    cachedFlights = Array.from({ length: 15 }).map((_, idx) => {
      const originKey = AIRPORT_KEYS[idx % AIRPORT_KEYS.length];
      const destKey = AIRPORT_KEYS[(idx + 2) % AIRPORT_KEYS.length];
      const origin = AIRPORTS[originKey];
      const dest = AIRPORTS[destKey];
      const progress = 0.2 + (idx * 0.05);

      const lat = origin.lat + (dest.lat - origin.lat) * progress + (Math.random() - 0.5) * 2;
      const lon = origin.lng + (dest.lng - origin.lng) * progress + (Math.random() - 0.5) * 2;

      return {
        id: `OS-${200 + idx}`,
        flightNumber: `OS${200 + idx}`,
        origin: originKey,
        destination: destKey,
        lat,
        lon,
        altitude: 11000,
        velocity: 245,
        heading: 90,
        status: 'in-flight',
        delayMinutes: 0,
        progressPct: progress,
        aircraftType: 'A350',
        gate: `A${idx + 1}`,
        cargoWeightKg: 12000,
      };
    });
  }

  return cachedFlights;
}

export function initOpenSkyService(io) {
  // Cron: refresh every 60 seconds
  cron.schedule('*/1 * * * *', async () => {
    try {
      const flights = await fetchOpenSkyFlights();
      io.emit('flights:init', flights);
    } catch (err) {
      console.error('[OpenSky Cron] Error:', err.message);
    }
  });
}
