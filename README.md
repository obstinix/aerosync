# AeroSync ✈️

**AI-augmented airline & cargo operations dashboard — portfolio prototype**

[![Status](https://img.shields.io/badge/status-prototype-orange?style=flat-square)](https://aerosync-td50.onrender.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

🌐 **Live Demo:** https://aerosync-td50.onrender.com  *(Render free tier — allow ~30s cold start)*

---

## What This Is

AeroSync is a **full-stack aviation operations dashboard** built to demonstrate:

- Real-time WebSocket architecture for flight state synchronization
- AI-assisted delay prediction using scikit-learn (Random Forest)
- Gantt-style drag-and-drop scheduling board
- 3D flight path visualization with CesiumJS / Mapbox GL
- Disruption simulation with cascade impact analysis

It's a **portfolio/prototype project**, not a production deployment. The architecture is designed for production readiness — the backend and AI service are fully coded — but the current live deployment only serves the React frontend with simulated data. See [Current State](#current-state) below.

---

## Current State

This is important to understand before cloning or extending the project:

| Layer | Status | Details |
|---|---|---|
| **React Frontend** | ✅ Deployed | Live at aerosync-td50.onrender.com |
| **Node.js Backend** | 🔧 Code complete, not deployed | Socket.IO + REST API ready in `/backend` |
| **Python AI Service** | 🔧 Code complete, not deployed | FastAPI + scikit-learn in `/ai-service` |
| **Real flight data** | ❌ Not integrated | Frontend uses 25 hardcoded mock flights |
| **Database** | ❌ Not integrated | All state is in-memory / frontend state |
| **Authentication** | ❌ JWT stub only | Middleware exists, not wired to routes |
| **WebSocket live feed** | ⚠️ Simulated | `setInterval` + `Math.random()` in frontend |

The deployed site shows you what the **UI and UX look like**. Running the full stack locally (see [Getting Started](#getting-started)) connects all three layers and gives you real WebSocket events.

---

## Features (Full Stack)

### Live Operations Dashboard
- 3D globe (CesiumJS / Mapbox GL) with animated flight arc trails
- Weather overlay via OpenWeatherMap API
- Real-time alert sidebar with severity badges (🔴 critical / 🟡 warning / 🟢 nominal)
- HUD metrics: active flights, delays, on-time %, cargo utilization
- Clickable flight popups with route, status, ETA, and cargo weight

### Smart Scheduling Board
- Gantt-style drag-and-drop timeline (aircraft rows × time blocks)
- Status-coded blocks: cyan (on-time), amber (delayed), red (cancelled)
- AI suggestions panel with confidence scores and explainer toggle
- Filters: hub, date range, aircraft type

### Cargo Intelligence Panel
- Manifest table filterable by flight, route, weight, and status
- Capacity utilization bars with threshold coloring
- Route optimization overlay: current vs AI-suggested
- Summary metrics: total cargo, overloaded flights, revenue at risk

### Disruption Simulator
- Inject weather, technical, or security events via form
- Severity slider + airport picker
- Cascade visualization showing affected flight ripple
- Impact summary: delay minutes, passengers, revenue loss estimate

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND  (React 18 + Vite 5)                          │
│  Framer Motion · D3.js · CesiumJS · Socket.IO Client    │
└──────────────────────────┬──────────────────────────────┘
                           │  HTTP REST + WSS
┌──────────────────────────▼──────────────────────────────┐
│  BACKEND  (Node.js 22 + Express 4 + Socket.IO 4)        │
│  /api/flights  /api/cargo  /api/disruptions/simulate     │
│  WS: flight:updated  cargo:updated  alert:new            │
└──────────────────────────┬──────────────────────────────┘
                           │  Internal HTTP
┌──────────────────────────▼──────────────────────────────┐
│  AI SERVICE  (Python 3.11 + FastAPI + scikit-learn)     │
│  POST /predict/delay  →  Random Forest classifier        │
│  POST /optimize/route →  Constraint-based heuristic      │
└─────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  EXTERNAL APIs                                          │
│  OpenWeatherMap · Mapbox GL · OpenSky Network            │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Package | Version | Role |
|---|---|---|
| React | 18.3.x | Component framework |
| Vite | 5.4.x | Build tool + dev server |
| Framer Motion | 11.x | Animations + transitions |
| D3.js | 7.9.x | Charts, Gantt timeline |
| Three.js | r165 | 3D WebGL |
| CesiumJS | 1.116 | Geospatial globe |
| Socket.IO Client | 4.7.x | WebSocket consumption |
| React Router | 6.x | Client-side routing |
| Tailwind CSS | 3.x | Utility styling |

### Backend
| Package | Version | Role |
|---|---|---|
| Node.js | 22.x LTS | Runtime |
| Express | 4.19.x | REST API |
| Socket.IO | 4.7.x | WebSocket server |
| Helmet | 7.x | Security headers |
| jsonwebtoken | 9.x | JWT auth (stub) |

### AI Service
| Package | Version | Role |
|---|---|---|
| Python | 3.11.x | Runtime |
| FastAPI | 0.110.x | Async REST framework |
| scikit-learn | 1.4.x | Random Forest delay model |
| pandas | 2.2.x | Data processing |
| numpy | 1.26.x | Numerical ops |

---

## Project Structure

```
aerosync/
├── frontend/                    # React + Vite SPA
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx              # Root + router
│       ├── components/
│       │   ├── Globe/           # CesiumJS 3D globe
│       │   ├── SchedulingBoard/ # Gantt + drag-drop
│       │   ├── CargoPanel/      # Manifest table
│       │   ├── DisruptionSim/   # Event injector
│       │   └── shared/          # Navbar, Toast, Badge
│       ├── hooks/
│       │   ├── useWebSocket.js  # Socket.IO hook
│       │   └── useFlightData.js # Flight state hook
│       ├── pages/
│       ├── store/               # Context / Zustand
│       └── data/
│           └── mockFlights.js   # 25 mock flights
│
├── backend/                     # Node.js + Express
│   ├── server.js
│   ├── routes/
│   │   ├── flights.js           # GET/PATCH /api/flights
│   │   ├── cargo.js             # GET /api/cargo
│   │   └── disruptions.js       # POST /api/disruptions/simulate
│   ├── sockets/
│   │   └── flightSocket.js      # WS emitters
│   └── middleware/
│       └── auth.js              # JWT middleware
│
├── ai-service/                  # Python FastAPI
│   ├── main.py
│   └── models/
│       ├── delay_predictor.py   # Random Forest
│       └── route_optimizer.py   # Constraint optimizer
│
└── docs/
    ├── PRD.md
    └── API_CONTRACTS.md
```

---

## API Reference

### REST Endpoints (Backend)

```
GET    /api/flights              List all flights with status
GET    /api/flights/:id          Single flight detail
PATCH  /api/flights/:id          Update status / gate / ETA
GET    /api/cargo                All cargo manifests
POST   /api/disruptions/simulate Inject disruption event
POST   /api/predict/delay        Proxy to AI service
```

### WebSocket Events

**Server → Client**
| Event | Payload | Trigger |
|---|---|---|
| `flight:updated` | `{ id, status, eta, gate }` | Every 3–5 s (random mutation) |
| `cargo:updated` | `{ flightId, weight, utilization }` | Load change |
| `alert:new` | `{ severity, message, flightId, timestamp }` | Operational event |
| `disruption:cascade` | `{ originAirport, affectedFlights[], totalDelay }` | Disruption ripple |

**Client → Server**
| Event | Payload |
|---|---|
| `disruption:inject` | `{ type, airport, severity }` |
| `schedule:update` | `{ flightId, newSlot }` |

### AI Prediction API

```http
POST /predict/delay
Content-Type: application/json

{
  "flightId": "AE-204",
  "origin": "JFK",
  "destination": "LHR",
  "scheduledDeparture": "2026-04-21T14:30:00Z",
  "weatherScore": 0.72
}
```

```json
{
  "delayProbability": 0.84,
  "estimatedDelayMinutes": 47,
  "confidence": 0.91,
  "reason": "High crosswind probability at LHR + historical delay pattern"
}
```

---

## Getting Started

### Prerequisites

```
Node.js  >= 18.x (22.x recommended)
Python   >= 3.9  (3.11 recommended)
npm      >= 9.x
pip      >= 23.x
```

### 1. Clone

```bash
git clone https://github.com/obstinix/aerosync.git
cd aerosync
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env          # add your VITE_MAPBOX_TOKEN
npm install
npm run dev
# → http://localhost:5173
```

### 3. Backend

```bash
cd backend
cp .env.example .env          # set PORT, JWT_SECRET, AI_SERVICE_URL
npm install
npm start
# → http://localhost:3001 (REST + WebSocket)
```

### 4. AI Service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# → http://localhost:8000
# → OpenAPI docs at /docs
```

Once all three are running, open the frontend and watch the socket connection indicator turn green.

---

## Environment Variables

### `/backend/.env`

```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
JWT_SECRET=your_secret_here
```

### `/frontend/.env`

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_OPENWEATHER_KEY=your_openweather_key
```

### `/ai-service/.env`

```env
MODEL_PATH=./models/delay_rf_v1.pkl
LOG_LEVEL=info
PORT=8000
```

---

## Deployment

The current live deployment is frontend-only on Render free tier (zero cost, cold starts).

**To deploy the full stack on Render:**

| Service | Type | Root Dir | Build | Start |
|---|---|---|---|---|
| Frontend | Static Site | `frontend` | `npm install && npm run build` | — |
| Backend | Web Service | `backend` | `npm install` | `npm start` |
| AI Service | Web Service | `ai-service` | `pip install -r requirements.txt` | `uvicorn main:app --host 0.0.0.0` |

Add a Render PostgreSQL database and pass the `DATABASE_URL` env var to the backend to persist flight state between restarts.

---

## Roadmap

### Phase 1 — Finish what's built
- [ ] Deploy backend as separate Render service (not just frontend)
- [ ] Deploy AI service alongside backend
- [ ] Wire frontend WebSocket to real backend (remove mock `setInterval`)
- [ ] Complete JWT auth (protect PATCH/POST routes)

### Phase 2 — Real data
- [ ] Integrate OpenSky Network API for live flight positions
- [ ] PostgreSQL database for persistent scheduling state
- [ ] Train delay model on real Kaggle airline delay dataset
- [ ] Mapbox token configured in production environment

### Phase 3 — Production hardening
- [ ] Mobile responsive layout
- [ ] Role-based access (dispatcher vs manager vs viewer)
- [ ] Multi-user collaborative scheduling (shared WS rooms)
- [ ] Rate limiting on disruption injector
- [ ] E2E tests (Playwright)
- [ ] PDF export for cargo manifests

---

## Contributing

```bash
git checkout -b feature/your-feature
git commit -m "feat: description"
git push origin feature/your-feature
# Open PR → main
```

---

## License

MIT — see [LICENSE](LICENSE).

---

*Built by [obstinix](https://github.com/obstinix) · React · Node.js · Python · Socket.IO · FastAPI*
