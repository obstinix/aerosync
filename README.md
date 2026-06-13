# AeroSync ✈️

**A full-stack, real-time aviation operations and cargo dispatch dashboard.**

AeroSync is an aviation control dashboard built to monitor and orchestrate active flights, coordinate cargo manifests, and simulate disruption cascade events. The platform is designed around a three-tier production architecture: an Express + Socket.IO server backed by a SQLite database with Drizzle ORM, a FastAPI AI service running a trained Random Forest model for delay predictions, and a React frontend styled with custom SpaceX-derived design tokens and animations.

---

## System Architecture

```mermaid
graph TD
  User((Operator Browser)) <-->|WebSocket & HTTP| Express[Express Server :3001]
  Express <-->|Better-SQLite3| DB[(SQLite Database)]
  User -->|HTTP POST| FastAPI[FastAPI AI Service :8000]
  FastAPI <-->|joblib| RF[Random Forest Model]
```

- **Express + Socket.IO Backend**: Connects to SQLite using Drizzle ORM. Serves REST API routes and hosts a Socket.IO WebSocket server to synchronize operational state. A database background ticker runs every 4 seconds to tick flight progress values.
- **FastAPI AI Service**: Loads a trained Random Forest regression model (`delay_rf_v1.pkl`) on startup to provide live delay probability and time predictions based on routes, carrier codes, departure slots, and weather factors.
- **Vite React Frontend**: Styled with stark SpaceX operations tokens (true black surfaces, hairline borders, zero shadows, maximum 4px radius, Space Grotesk and JetBrains Mono typography). Animates updates using Framer Motion. Uses Leaflet with CartoDB Dark Matter tiles for geospatial tracking.

---

## Features

- **Live Operations Monitoring**: Geospatial tracking via a dark CartoDB Leaflet map, displaying pulsing flight markers and route arcs. Ingests real-time events via an active WebSockets connection.
- **System metrics HUD**: Displays live active flights, delayed counts, on-time percentage, and cargo utilization rates.
- **Runway Scheduling Board**: A runway timeline display mapping active flight blocks, integrating drag-and-drop slots and AI delay prediction advisories.
- **Cargo Dispatch Intelligence**: Monitors manifest weights, priority status levels, and capacity limits.
- **Disruption Simulator**: Simulates operational events (weather, security, equipment) at specific hubs and calculates cascade delay ripple impacts.

---

## API Reference

### REST Endpoints (Backend)

```
GET    /api/flights              List all flights with status
GET    /api/flights/:id          Single flight details
PATCH  /api/flights/:id          Update flight status, gate, or ETA
GET    /api/cargo                List all cargo manifests
POST   /api/disruptions/simulate Inject a simulated disruption event
GET    /health                   Verify server and database health
```

### REST Endpoints (AI Service)

```
POST   /predict/delay            Predict delay probability and minutes
GET    /health                   Verify model load status
```

### WebSocket Events

| Event | Payload | Trigger |
|---|---|---|
| `flight:updated` | `{ id, status, progressPct, delayMinutes }` | Flight progress background ticker (4s) |
| `cargo:updated` | `{ flightId, weightKg, utilization }` | Manifest change |
| `alert:new` | `{ id, severity, message, timestamp }` | Operational event or disruption cascade |
| `disruption:cascade` | `{ origin, affectedCount, estimatedTotalDelay }` | Disruption cascade ripple |

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.19.x (22.x recommended)
- **Python** >= 3.9 (3.11 recommended)
- **npm** >= 10.x

### 1. Clone & Install Dependencies

Clone the repository:

```bash
git clone https://github.com/obstinix/aerosync.git
cd aerosync
```

Install the project dependencies from the root directory (uses npm workspaces to set up both backend and frontend):

```bash
npm install
```

### 2. Configure Environment Variables

Create environment config files for both frontend and backend.

For the **backend** (`/backend/.env`):

```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
JWT_SECRET=your_jwt_secret_token
```

For the **frontend** (`/frontend/.env`):

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_AI_URL=http://localhost:8000
```

### 3. Initialize and Seed the Database

A SQLite database file (`aerosync.db`) is automatically initialized and migrated on backend startup. To pre-populate it with realistic flight schedules and cargo manifests, run the seed script:

```bash
npm run seed --workspace=backend
```

### 4. Setup and Run the AI Service

Create a virtual environment, install requirements, and launch the FastAPI app using Uvicorn:

```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate       # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 5. Launch Backend & Frontend Dev Servers

Return to the root directory and run the concurrent development command:

```bash
cd ..
npm run dev
```

- The React frontend will run at [http://localhost:5173](http://localhost:5173)
- The Express backend will run at [http://localhost:3001](http://localhost:3001)

---

## Deployment Specs

For production builds:

| Service | Directory | Build Command | Start Command |
|---|---|---|---|
| **Frontend** | `frontend` | `npm run build` | Serves statically |
| **Backend** | `backend` | `npm install` | `npm start` |
| **AI Service** | `ai-service` | `pip install -r requirements.txt` | `uvicorn main:app --host 0.0.0.0 --port 8000` |

---

## License

MIT
