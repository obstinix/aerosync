# AeroSync — API Contracts

## REST API (Backend — Port 3001)

### GET /api/health
```json
{ "status": "ok", "timestamp": "2026-04-21T00:00:00Z", "service": "aerosync-backend" }
```

### GET /api/flights
Query params: `hub` (airport code), `status` (flight status)
```json
{ "flights": [...], "total": 25 }
```

### GET /api/flights/:id
```json
{ "id": "AS000", "origin": "JFK", "destination": "LHR", "status": "in-flight", ... }
```

## WebSocket Events (Socket.IO — Port 3001)

### Server → Client
- `flight:update` — `{ flightId, status, delay, timestamp }`
- `disruption:result` — `{ airport, affectedCount, totalDelay }`

### Client → Server
- `disruption:inject` — `{ type, airport, severity }`

## AI Service (Python — Port 8000)

### POST /api/optimize
```json
// Request
{ "flight_id": "AS000", "origin": "JFK", "destination": "LHR", "current_status": "delayed" }
// Response
{ "flight_id": "AS000", "suggestion": { "type": "reroute", "confidence": 0.92, ... } }
```

### POST /api/predict-disruption
```json
// Request
{ "airport": "JFK", "event_type": "weather", "severity": 0.8 }
// Response
{ "prediction": { "affected_flights": 7, "total_delay_minutes": 240, ... } }
```

### POST /api/cargo-balance
```json
// Request
[{ "id": "AS000", "cargoUtilization": 95 }, ...]
// Response
{ "suggestions": [{ "flight_id": "AS000", "action": "offload", "amount_tons": 3.5 }] }
```
