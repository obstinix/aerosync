const express = require('express');
const router = express.Router();

// In-memory mock data
const AIRPORTS = ['JFK', 'LHR', 'DXB', 'SIN', 'LAX'];
const statuses = ['on-time', 'delayed', 'in-flight', 'boarding', 'landed', 'cancelled'];

function generateFlights() {
  return Array.from({ length: 25 }, (_, i) => ({
    id: `AS${String(1000 + i).slice(1)}`,
    origin: AIRPORTS[i % 5],
    destination: AIRPORTS[(i + 2) % 5],
    status: statuses[i % 6],
    aircraft: ['B777-300ER', 'A380-800', 'B787-9'][i % 3],
    cargoWeight: Math.floor(2 + Math.random() * 43),
    maxCargo: Math.floor(50 + Math.random() * 30),
    delay: statuses[i % 6] === 'delayed' ? Math.floor(15 + Math.random() * 165) : 0,
    passengers: Math.floor(120 + Math.random() * 330),
  }));
}

let flights = generateFlights();

router.get('/', (req, res) => {
  const { hub, status } = req.query;
  let result = flights;
  if (hub) result = result.filter(f => f.origin === hub || f.destination === hub);
  if (status) result = result.filter(f => f.status === status);
  res.json({ flights: result, total: result.length });
});

router.get('/:id', (req, res) => {
  const flight = flights.find(f => f.id === req.params.id);
  if (!flight) return res.status(404).json({ error: 'Flight not found' });
  res.json(flight);
});

module.exports = router;
