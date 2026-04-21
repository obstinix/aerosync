<p align="center">
  <img src="docs/assets/aerosync-logo.png" alt="AeroSync Logo" width="140" />
</p>

<h1 align="center">✈️ AeroSync</h1>

<p align="center">
  <strong>Real-Time AI-Powered Airline & Cargo Scheduling Platform</strong><br/>
  Mission-critical operations intelligence for modern aviation logistics
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-live-00E5FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/version-1.0.0-FFB800?style=for-the-badge" />
  <img src="https://img.shields.io/badge/license-MIT-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/deploy-Render-46E3B7?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js" />
</p>

<p align="center">
  🌐 <strong>Live Demo:</strong> <a href="https://aerosync-td50.onrender.com">https://aerosync-td50.onrender.com</a> &nbsp;|&nbsp;
  📦 <strong>Repo:</strong> <a href="https://github.com/obstinix/aerosync">github.com/obstinix/aerosync</a>
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Core Features](#-core-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack-with-versions)
- [Project Structure](#-project-structure)
- [Data Flow](#-data-flow)
- [WebSocket Events](#-websocket-event-schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment-render)
- [Branch Strategy](#-branch-strategy)
- [Roadmap](#-roadmap)

---

## 🌐 Overview

**AeroSync** is a full-stack, real-time aviation operations platform built for airline dispatchers, cargo managers, and operations leads. It unifies flight scheduling, cargo logistics, weather intelligence, and AI-driven optimization into a single glassmorphism dark-mode interface inspired by mission control.

The platform uses **WebSocket-powered live data streams** to keep all connected clients in sync without page refreshes, an **AI recommendation engine** that predicts delays and suggests optimal routing, and a **3D globe visualization** for live flight path rendering.

> Built as a portfolio + hackathon-grade project demonstrating distributed system design, real-time architecture, AI integration, and production-grade frontend engineering.

---

## 🚀 Live Demo

| Screen | URL |
|--------|-----|
| Live Operations Dashboard | [aerosync-td50.onrender.com](https://aerosync-td50.onrender.com) |
| Smart Scheduling Board | [aerosync-td50.onrender.com/scheduling](https://aerosync-td50.onrender.com/scheduling) |
| Cargo Intelligence Panel | [aerosync-td50.onrender.com/cargo](https://aerosync-td50.onrender.com/cargo) |
| Disruption Simulator | [aerosync-td50.onrender.com/simulator](https://aerosync-td50.onrender.com/simulator) |

> ⚠️ Hosted on Render Free Tier — first load may take 30–50 seconds to spin up.

---

## 🔥 Core Features

### 🌍 1. Live Operations Dashboard
- Full-screen **3D globe** (CesiumJS / Mapbox GL) with animated flight arc trails
- **Weather overlay toggle** — storm zones rendered as animated color gradients using OpenWeatherMap API
- **Real-time alerts sidebar** — color-coded severity badges (🔴 critical / 🟡 warning / 🟢 nominal) with live timestamp
- **HUD strip** — 4 live stat tiles: Active Flights, Delayed, On-Time %, Cargo Utilization
- **Flight popup cards** — click any arc to see Flight ID, route, status, ETA, cargo weight

### 📅 2. Smart Scheduling Board
- **Gantt-style drag-and-drop timeline** — aircraft rows × time blocks
- **Status-coded flight blocks**: cyan (on-time), amber (delayed), red (cancelled)
- **AI Suggestions panel** — recommendation cards with confidence score bars and "Why?" explainer toggle
- Filter bar: hub selector, date picker, aircraft type dropdown

### 📦 3. Cargo Intelligence Panel
- **Manifest table** — filterable by flight, route, weight, status
- **Capacity utilization bars** — green < 70%, amber 70–90%, red > 90%
- **Route optimization mini-map** — current vs AI-suggested routing overlay
- **Metric cards**: Total Cargo (tons), Overloaded Flights, Revenue at Risk

### ⚡ 4. Disruption Simulator
- Inject: **Weather / Technical / Security** events via dropdown
- **Severity slider** + airport picker controls
- **Cascade impact visualization** — animated ripple diagram showing affected flights radiating from disruption point
- **Impact summary**: Total delays, Passengers affected, Estimated revenue loss

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│   React 18 + Vite 5   │   Framer Motion 11   │   D3.js v7      │
│   CesiumJS / Mapbox    │   Socket.IO Client   │   Tailwind CSS  │
└────────────────────────────────┬────────────────────────────────┘
                                 │  HTTP REST + WebSocket (WSS)
┌────────────────────────────────▼────────────────────────────────┐
│                        API GATEWAY LAYER                        │
│              Node.js 22 + Express 4 + Socket.IO 4               │
│   ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│   │  REST Routes │  │  WS Sockets  │  │    Middleware       │   │
│   │  /flights    │  │  flight:upd  │  │  CORS, Auth, Rate  │   │
│   │  /cargo      │  │  cargo:upd   │  │  Limit, Helmet     │   │
│   │  /disruption │  │  alert:new   │  │                    │   │
│   └──────────────┘  └──────────────┘  └────────────────────┘   │
└────────────────────────────────┬────────────────────────────────┘
                                 │  HTTP (Internal)
┌────────────────────────────────▼────────────────────────────────┐
│                        AI SERVICE LAYER                         │
│              Python 3.11 + FastAPI 0.110 + Uvicorn              │
│   ┌──────────────────┐    ┌──────────────────────────────────┐  │
│   │  Delay Predictor │    │   Route Optimizer                │  │
│   │  scikit-learn    │    │   Constraint-based heuristic     │  │
│   │  Random Forest   │    │   + confidence scoring           │  │
│   └──────────────────┘    └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│                        EXTERNAL APIs                            │
│   OpenWeatherMap API   │   Mapbox GL API   │   OpenSky Network  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack (with Versions)

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.x | UI component framework |
| **Vite** | 5.4.x | Build tool + dev server (ESBuild-based) |
| **Framer Motion** | 11.x | Declarative animations + micro-interactions |
| **D3.js** | 7.9.x | Data-driven charts, Gantt timeline, bar charts |
| **Three.js** | r165 | 3D WebGL rendering for globe effects |
| **CesiumJS** | 1.116 | Geospatial 3D globe + flight arc visualization |
| **Socket.IO Client** | 4.7.x | WebSocket real-time data consumption |
| **React Router** | 6.x | Client-side routing (4 screens) |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 22.x LTS | JavaScript runtime |
| **Express** | 4.19.x | REST API framework |
| **Socket.IO** | 4.7.x | WebSocket server + room management |
| **Helmet** | 7.x | HTTP security headers |
| **CORS** | 2.8.x | Cross-origin resource sharing |
| **dotenv** | 16.x | Environment variable management |

### AI Service
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.11.x | Runtime |
| **FastAPI** | 0.110.x | Async REST API framework |
| **Uvicorn** | 0.29.x | ASGI server |
| **scikit-learn** | 1.4.x | ML models (Random Forest delay predictor) |
| **pandas** | 2.2.x | Flight data processing + feature engineering |
| **numpy** | 1.26.x | Numerical computations |

### DevOps & Infrastructure
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Render.com** | — | Cloud hosting (Node.js web service) |
| **GitHub Actions** | — | CI/CD pipeline (auto-deploy on push) |
| **Git** | 2.x | Version control |

---

## 📁 Project Structure

```
aerosync/
│
├── 📄 README.md
├── 📄 .gitignore
├── 📄 render.yaml                  # Render deployment config
│
├── 📂 frontend/                    # React + Vite SPA
│   ├── 📄 package.json
│   ├── 📄 vite.config.js           # Vite config with preview allowedHosts
│   ├── 📄 index.html               # Entry HTML
│   └── 📂 src/
│       ├── 📄 App.jsx              # Root component + router
│       ├── 📄 main.jsx             # React DOM entry point
│       ├── 📂 components/
│       │   ├── 📂 Globe/           # CesiumJS 3D globe + flight arcs
│       │   ├── 📂 SchedulingBoard/ # Gantt timeline + drag-drop
│       │   ├── 📂 CargoPanel/      # Manifest table + util bars
│       │   ├── 📂 DisruptionSim/   # Event injector + cascade viz
│       │   └── 📂 shared/          # Navbar, Toast, Skeleton, Badge
│       ├── 📂 hooks/
│       │   ├── 📄 useWebSocket.js  # Socket.IO connection hook
│       │   └── 📄 useFlightData.js # Flight state management hook
│       ├── 📂 pages/               # Page-level route components
│       ├── 📂 store/               # Global state (Context API / Zustand)
│       └── 📂 data/
│           └── 📄 mockFlights.js   # 25 mock flights across 5 hubs
│
├── 📂 backend/                     # Node.js + Express + Socket.IO
│   ├── 📄 package.json
│   ├── 📄 server.js                # Express app + Socket.IO init
│   ├── 📂 routes/
│   │   ├── 📄 flights.js           # GET/PATCH /api/flights
│   │   ├── 📄 cargo.js             # GET /api/cargo
│   │   └── 📄 disruptions.js       # POST /api/disruptions/simulate
│   ├── 📂 sockets/
│   │   └── 📄 flightSocket.js      # WS event emitters (5s interval)
│   └── 📂 middleware/
│       └── 📄 auth.js              # JWT middleware
│
├── 📂 ai-service/                  # Python FastAPI AI engine
│   ├── 📄 requirements.txt
│   ├── 📄 main.py                  # FastAPI app entry
│   └── 📂 models/
│       ├── 📄 delay_predictor.py   # Random Forest delay model
│       └── 📄 route_optimizer.py   # Constraint-based optimizer
│
└── 📂 docs/
    ├── 📄 PRD.md                   # Product Requirements Document
    └── 📄 API_CONTRACTS.md         # REST + WebSocket API specs
```

---

## 🔄 Data Flow

```
OpenWeatherMap API ──────────────────────────────────┐
                                                     ▼
Mock Flight Data ──► Backend (Node.js) ──► Socket.IO ──► React Client
                          │                              │
                          │ POST /predict                │ Renders:
                          ▼                              │  - 3D Globe
                    AI Service (FastAPI)                 │  - Gantt Board
                          │                              │  - Cargo Panel
                          └── delay probability ─────────┘  - Disruption Sim
                              + route suggestion
```

Every **3–5 seconds**, the backend emits a `flight:updated` WebSocket event with a randomly mutated flight status. All connected clients receive the update simultaneously — no polling, no refresh.

---

## 📡 WebSocket Event Schema

### Events emitted by server → client

| Event | Payload | Description |
|-------|---------|-------------|
| `flight:updated` | `{ id, status, eta, gate }` | Single flight status change |
| `cargo:updated` | `{ flightId, weight, utilization }` | Cargo load update |
| `alert:new` | `{ severity, message, flightId, timestamp }` | New operational alert |
| `disruption:cascade` | `{ originAirport, affectedFlights[], totalDelay }` | Disruption ripple event |

### Events emitted by client → server

| Event | Payload | Description |
|-------|---------|-------------|
| `disruption:inject` | `{ type, airport, severity }` | Trigger simulated disruption |
| `schedule:update` | `{ flightId, newSlot }` | Drag-drop schedule change |

---

## 📋 API Reference

### REST Endpoints

```
GET    /api/flights              → List all flights (with status)
GET    /api/flights/:id          → Single flight detail
PATCH  /api/flights/:id          → Update flight status/gate/ETA
GET    /api/cargo                → All cargo manifests
POST   /api/disruptions/simulate → Inject disruption event
POST   /api/predict/delay        → AI delay prediction (proxied to FastAPI)
```

### Example: Predict Delay
```json
POST /api/predict/delay
{
  "flightId": "AE-204",
  "origin": "JFK",
  "destination": "LHR",
  "scheduledDeparture": "2026-04-21T14:30:00Z",
  "weatherScore": 0.72
}

Response:
{
  "delayProbability": 0.84,
  "estimatedDelayMinutes": 47,
  "confidence": 0.91,
  "reason": "High crosswind probability at LHR + historical delay pattern"
}
```

---

## ⚙️ Getting Started

### Prerequisites

```
Node.js   >= 18.x (22.x recommended)
Python    >= 3.9  (3.11 recommended)
npm       >= 9.x
pip       >= 23.x
Git       >= 2.x
```

### 1. Clone the Repository

```bash
git clone https://github.com/obstinix/aerosync.git
cd aerosync
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 3. Backend Setup

```bash
cd backend
npm install
npm start
# → http://localhost:3001
# → WebSocket on ws://localhost:3001
```

### 4. AI Service Setup

```bash
cd ai-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# → http://localhost:8000
# → Docs at http://localhost:8000/docs
```

---

## 🔐 Environment Variables

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
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### `/ai-service/.env`
```env
MODEL_PATH=./models/delay_rf_v1.pkl
LOG_LEVEL=info
```

---

## ☁️ Deployment (Render)

AeroSync is deployed on **Render.com** as a Node.js Web Service.

| Setting | Value |
|---------|-------|
| **Platform** | Render.com Free Tier |
| **Runtime** | Node.js 22.x |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run preview` |
| **Auto-Deploy** | ✅ On every push to `main` |
| **Live URL** | https://aerosync-td50.onrender.com |

> For production: migrate to Render Standard tier + add a separate backend service + PostgreSQL database add-on.

---

## 🌿 Branch Strategy

| Branch | Purpose | Status |
|--------|---------|--------|
| `main` | Production-ready releases | ✅ Live |
| `dev` | Active development integration | 🔄 Active |
| `feature/ui-dashboard` | Live Operations Dashboard | ✅ Merged |
| `feature/ai-engine` | AI recommendation engine | ✅ Merged |
| `feature/cargo-panel` | Cargo intelligence + disruption sim | ✅ Merged |

---

## 🗺️ Roadmap

- [x] Live Operations Dashboard with 3D globe
- [x] Smart Scheduling Board (Gantt + drag-drop)
- [x] Cargo Intelligence Panel
- [x] Disruption Simulator
- [x] WebSocket real-time updates
- [x] Deploy to Render.com
- [ ] Real flight data via OpenSky Network API
- [ ] PostgreSQL database (replace mock data)
- [ ] User authentication (JWT + refresh tokens)
- [ ] Mobile responsive layout
- [ ] AI model trained on real delay dataset (Kaggle)
- [ ] Multi-user collaboration (shared scheduling sessions)
- [ ] Export reports as PDF

---

## 🤝 Contributing

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open a Pull Request → dev branch
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ✈️ by <a href="https://github.com/obstinix">obstinix</a><br/>
  <sub>React · Node.js · Python · Socket.IO · CesiumJS · Render</sub>
</p>
