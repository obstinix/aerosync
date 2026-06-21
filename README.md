<div align="center">

<img src="docs/assets/aerosync-logo.png" alt="AeroSync Logo" width="120"/>

# ✈️ AeroSync

### Real-Time AI-Powered Aviation Operations Intelligence Platform
**Built for Indian Airspace — Air India · IndiGo · SpiceJet · Air Asia India**

[![Status](https://img.shields.io/badge/status-live-00E5FF?style=for-the-badge)](https://aerosync-td50.onrender.com)
[![Version](https://img.shields.io/badge/version-1.0.0-FFB800?style=for-the-badge)](https://github.com/obstinix/aerosync/releases)
[![License](https://img.shields.io/badge/license-MIT-brightgreen?style=for-the-badge)](LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-Render-46E3B7?style=for-the-badge)](https://render.com)

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)
[![Three.js](https://img.shields.io/badge/three--globe-WebGL-FF6F00?style=flat-square&logo=three.js&logoColor=white)](https://github.com/vasturiano/three-globe)

[![GitHub stars](https://img.shields.io/github/stars/obstinix/aerosync?style=social)](https://github.com/obstinix/aerosync/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/obstinix/aerosync?style=social)](https://github.com/obstinix/aerosync/network/members)
[![Last commit](https://img.shields.io/github/last-commit/obstinix/aerosync?style=flat-square&color=00D4FF)](https://github.com/obstinix/aerosync/commits/main)
[![Open issues](https://img.shields.io/github/issues/obstinix/aerosync?style=flat-square&color=FFB020)](https://github.com/obstinix/aerosync/issues)

🌐 **Live Demo:** [aerosync-td50.onrender.com](https://aerosync-td50.onrender.com) · 📦 **Repo:** [github.com/obstinix/aerosync](https://github.com/obstinix/aerosync)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Core Features](#-core-features)
- [System Architecture](#️-system-architecture)
- [How It Works — Step by Step](#-how-it-works--step-by-step)
- [Tech Stack](#️-tech-stack-with-versions)
- [Project at a Glance](#-project-at-a-glance)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Getting Started](#️-getting-started)
- [Environment Variables](#-environment-variables)
- [Design System](#-design-system)
- [Deployment](#️-deployment)
- [Roadmap](#️-roadmap)
- [Contributing](#-contributing)
- [Contributors](#-contributors)
- [License](#-license)

---

## 🌐 Overview

**AeroSync** is a full-stack, real-time aviation operations intelligence platform built for airline
dispatchers, cargo managers, and operations leads working across Indian airspace. It unifies live
flight tracking, AI-driven delay prediction, cargo logistics, disruption simulation, and a
conversational AI recovery agent into a single terminal/cinematic dark-mode interface inspired by
mission control rooms.

The platform tracks a live network of flights operated by **Air India, IndiGo, SpiceJet, and Air
Asia India** across ten major Indian hubs (DEL, BOM, BLR, MAA, CCU, HYD, PNQ, GOI, JAI, AMD),
rendered on an interactive **3D WebGL globe** with animated flight arcs, real-time aircraft
markers, and a UTC-synced day/night terminator.

> Originally built as a portfolio-grade demonstration of distributed system design, real-time
> architecture, and applied ML — since evolved into a feature-complete ops intelligence platform
> with an LLM-powered recovery agent at its core.

---

## 🚀 Live Demo

| Screen | Description |
|---|---|
| [`/`](https://aerosync-td50.onrender.com) | Landing — live network stats over a rotating 3D globe |
| [`/operations`](https://aerosync-td50.onrender.com/operations) | Live Operations Dashboard |
| [`/scheduling`](https://aerosync-td50.onrender.com/scheduling) | Smart Scheduling Board (Gantt) |
| [`/cargo`](https://aerosync-td50.onrender.com/cargo) | Cargo Intelligence Panel |
| [`/disruptions`](https://aerosync-td50.onrender.com/disruptions) | Disruption Simulator |
| [`/warroom`](https://aerosync-td50.onrender.com/warroom) | AI War Room — LLM recovery agent |
| [`/analytics`](https://aerosync-td50.onrender.com/analytics) | Historical Delay Analytics |

> ⚠️ Hosted on Render's free tier — first load may take 30–50 seconds to spin up from a cold start.

---

## 🔥 Core Features

### 🌍 Live Operations Dashboard
Full-screen interactive **3D globe** (`three-globe` / WebGL) with animated flight arc trails, live
aircraft markers that travel along routes in real time, a UTC-synced day/night terminator, and a
toggleable India-only delay-density heatmap. A scrolling **telemetry strip** surfaces live network
stress as an oscilloscope-style waveform, color-shifting cyan → amber → red under load.

### 📅 Smart Scheduling Board
Gantt-style drag-and-drop timeline with status-coded flight blocks, AI confidence-scored
suggestions, and a **"What If" sandbox mode** that isolates schedule experiments, recomputes delay
predictions live, and shows a diff with estimated revenue impact before committing changes.

### 📦 Cargo Intelligence Panel
Filterable manifest table, capacity utilization bars, and a route optimization mini-map comparing
current vs AI-suggested routing — plus one-click PDF/CSV export for ops briefings.

### ⚡ Disruption Simulator
Inject weather, technical, or security events and watch a **D3 force-simulated cascade
visualization** ripple across the globe in real time, with arcs shifting cyan → amber → red as the
disruption propagates through the network.

### 🤖 AI War Room
A split-view command console — live globe on one side, a streaming LLM chat interface on the
other. Dispatchers ask for recovery plans in plain language ("mitigate delays at BOM") and receive
structured responses with immediate actions, rebooking suggestions, and a confidence score,
generated by an LLM with live flight-state context injected via tool-calling.

### ⌨️ Power Tools
A `Cmd+K` command palette for instant flight/airport/page search, a `?`-triggered keyboard
shortcuts overlay, a Solari split-flap "now boarding" departure board, and a persistent network
health badge in the header — all themed consistently with the rest of the platform.

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Client["CLIENT LAYER — React 18 + Vite 5"]
        A1[Landing / Hero]
        A2[Live Operations]
        A3[Scheduling Board]
        A4[Cargo Intelligence]
        A5[Disruption Simulator]
        A6[AI War Room]
        A7[Globe3D — three-globe / WebGL]
    end

    subgraph Gateway["API GATEWAY — Node.js 22 + Express 4 + Socket.IO 4"]
        B1[REST Routes]
        B2[WebSocket Server]
        B3[JWT Middleware]
        B4[Rate Limiter]
    end

    subgraph AI["AI SERVICE — Python 3.11 + FastAPI"]
        C1[Delay Predictor — scikit-learn Random Forest]
        C2[Route Optimizer — constraint-based]
        C3[War Room Chat — LLM tool-calling]
    end

    subgraph Data["DATA LAYER"]
        D1[(PostgreSQL)]
    end

    subgraph External["EXTERNAL SOURCES"]
        E1[OpenSky Network — live ADS-B]
        E2[OpenWeatherMap]
        E3[LLM Provider — Anthropic / OpenAI]
    end

    Client <-->|HTTPS + WSS| Gateway
    Gateway -->|internal HTTP| AI
    Gateway <--> D1
    AI --> D1
    C3 <--> E3
    Gateway --> E1
    Client --> E2
```

---

## 🔄 How It Works — Step by Step

**1. Live position ingestion** — The backend polls the OpenSky Network ADS-B API every 60 seconds
for real-time aircraft positions across the tracked Indian flight network, caching results to stay
within free-tier rate limits.

**2. Delay prediction** — Each flight update is passed to the FastAPI AI service, where a
scikit-learn Random Forest model scores delay probability based on weather, hub congestion, and
historical patterns, returning a confidence-scored estimate.

**3. Persistence** — Both the flight state and the prediction are written to PostgreSQL, so
schedule changes, cargo assignments, and AI predictions survive page refreshes and service
restarts — closing the original "everything resets" gap from early prototypes.

**4. Real-time broadcast** — The backend emits a `flight:updated` event over Socket.IO, scoped to
hub-specific rooms so clients only receive updates relevant to what they're viewing.

**5. Client render** — Connected dashboards update instantly: the 3D globe repositions aircraft
markers along their arcs, the Gantt board reflects new statuses, and the alert log and toast
system surface anything severity-critical — all without a page reload.

**6. AI War Room loop** — When a dispatcher sends a message, the AI service streams a response
over Server-Sent Events, with the current flight-state snapshot injected as context so the LLM's
recovery plan reflects what's actually happening on the network right now, not stale training data.

```mermaid
sequenceDiagram
    participant U as Dispatcher
    participant FE as War Room UI
    participant AI as AI Service
    participant LLM as LLM Provider

    U->>FE: "Mitigate delays at BOM"
    FE->>AI: POST /chat (SSE)
    AI->>LLM: System prompt + live flight context
    LLM-->>AI: Streamed recovery plan
    AI-->>FE: SSE token stream
    FE-->>U: Rendered plan + confidence score
```

---

## 🛠️ Tech Stack (with Versions)

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3.x | UI component framework |
| **Vite** | 5.4.x | Build tool + dev server |
| **Framer Motion** | 11.x | Animations + page transitions |
| **D3.js** | 7.9.x | Gantt timeline, disruption cascade force simulation |
| **three-globe / globe.gl** | latest | WebGL 3D earth — arcs, points, custom object layers |
| **Socket.IO Client** | 4.7.x | Real-time WebSocket data |
| **React Router** | 6.x | Client-side routing |
| **cmdk** | latest | Cmd+K command palette |
| **@floating-ui/react** | latest | Tooltip positioning system |
| **Howler.js** | latest | Subtle UI sound design |
| **Recharts** | latest | Historical analytics charts |
| **jsPDF / Papaparse** | latest | PDF and CSV export |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 22.x LTS | JavaScript runtime |
| **Express** | 4.19.x | REST API framework |
| **Socket.IO** | 4.7.x | WebSocket server + hub-scoped rooms |
| **Prisma** | latest | PostgreSQL ORM |
| **express-rate-limit** | latest | Disruption endpoint throttling |
| **Helmet / CORS** | latest | Security headers, cross-origin policy |

### AI Service
| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.11.x | Runtime |
| **FastAPI** | 0.110.x | Async REST + SSE streaming |
| **scikit-learn** | 1.4.x | Random Forest delay predictor |
| **pandas / numpy** | 2.2.x / 1.26.x | Feature engineering |
| **Pydantic** | 2.x | Request validation |

### DevOps & Infrastructure
| Technology | Purpose |
|---|---|
| **Render.com** | Multi-service cloud hosting (frontend, backend, AI service, PostgreSQL) |
| **Docker Compose** | One-command local development |
| **GitHub Actions** | CI/CD on push to `main` |

---

## 📊 Project at a Glance

| Metric | Value |
|---|---|
| Active Indian airline carriers tracked | Air India · IndiGo · SpiceJet · Air Asia India |
| Hub airports | 10 (DEL, BOM, BLR, MAA, CCU, HYD, PNQ, GOI, JAI, AMD) |
| Frontend pages | 7 (Landing, Operations, Scheduling, Cargo, Disruptions, War Room, Analytics) |
| Custom React components | 15+ |
| WebSocket event types | 6 |
| REST + SSE endpoints | 10+ |
| Services in production | 3 (frontend, backend, AI service) + PostgreSQL |

[![Languages](https://img.shields.io/github/languages/count/obstinix/aerosync?style=flat-square)](https://github.com/obstinix/aerosync)
[![Top language](https://img.shields.io/github/languages/top/obstinix/aerosync?style=flat-square)](https://github.com/obstinix/aerosync)
[![Commit activity](https://img.shields.io/github/commit-activity/m/obstinix/aerosync?style=flat-square&color=00D4FF)](https://github.com/obstinix/aerosync/commits/main)

> AeroSync is an actively developed, early-stage project — commit velocity and contributor count
> are expected to grow as the platform matures past its initial build-out phase.

---

## 📁 Project Structure

```
aerosync/
├── README.md
├── render.yaml                     # Multi-service Render deployment config
├── docker-compose.yml              # One-command local dev environment
├── GEMINI.md / CLAUDE.md           # Persistent agent project memory
│
├── frontend/                       # React + Vite SPA
│   └── src/
│       ├── App.jsx                 # Root component, router, route-level ErrorBoundaries
│       ├── pages/
│       │   ├── Landing.jsx         # Hero, live stat counters, globe background
│       │   ├── DashboardPage.jsx   # Live Operations
│       │   ├── Scheduling.jsx      # Gantt board + sandbox mode
│       │   ├── Cargo.jsx           # Cargo Intelligence
│       │   ├── WarRoom.jsx         # AI recovery agent split-view
│       │   └── Analytics.jsx       # Historical delay charts
│       ├── components/
│       │   ├── Globe3D.jsx         # three-globe wrapper — arcs, custom layer aircraft
│       │   ├── SolariTicker.jsx    # Split-flap departure board
│       │   ├── AirportDrawer.jsx   # Slide-in airport detail panel
│       │   ├── CommandPalette.jsx  # Cmd+K global search
│       │   ├── ToastManager.jsx    # Ephemeral notification system
│       │   ├── NetworkPulse.jsx    # Live network stress oscilloscope
│       │   ├── ErrorBoundary.jsx   # Themed, contained crash fallback
│       │   └── Tooltip.jsx         # Floating-UI tooltip system
│       └── data/
│           └── indianFlights.js    # Indian airline/airport reference data
│
├── backend/                        # Node.js + Express + Socket.IO
│   ├── prisma/schema.prisma        # Flight, Cargo, Alert, DelayPrediction, User models
│   ├── services/openskyService.js  # OpenSky ADS-B polling + caching
│   └── routes/                     # flights, cargo, disruptions, auth
│
├── ai-service/                     # Python FastAPI AI engine
│   ├── main.py
│   ├── routers/chat.py             # SSE-streamed LLM recovery agent endpoint
│   └── models/
│       ├── delay_predictor.py
│       └── route_optimizer.py
│
└── docs/
    ├── PRD.md
    └── API_CONTRACTS.md
```

---

## 📋 API Reference

### REST & SSE Endpoints
```
GET    /api/flights                → List all tracked flights
PATCH  /api/flights/:id            → Update flight (auth required, persists to PostgreSQL)
GET    /api/cargo                  → All cargo manifests
POST   /api/disruptions/simulate   → Inject disruption event (rate-limited, auth required)
POST   /api/predict/delay          → AI delay prediction (proxied to FastAPI)
POST   /chat                       → AI War Room recovery agent (Server-Sent Events stream)
POST   /api/auth/demo-login        → Issue short-lived demo JWT
```

### Example — Predict Delay
```
POST /api/predict/delay
{
  "flightId": "6E-201",
  "originCode": "BOM",
  "destinationCode": "BLR",
  "scheduledDep": "2026-06-22T09:30:00Z",
  "weatherScore": 0.42,
  "hubCongestion": 0.61
}

Response:
{
  "delayProbability": 0.58,
  "estimatedDelayMinutes": 25,
  "confidence": 0.87
}
```

### WebSocket Events
| Event | Direction | Payload |
|---|---|---|
| `flight:updated` | server → client | `{ id, status, lat, lng, delayMinutes }` |
| `cargo:updated` | server → client | `{ flightId, weight, utilization }` |
| `alert:new` | server → client | `{ severity, message, flightId, timestamp }` |
| `disruption:cascade` | server → client | `{ originAirport, affectedFlights[], totalDelay }` |
| `join:hub` | client → server | `hubCode` (scopes updates to a specific hub room) |
| `schedule:update` | client → server | `{ flightId, newSlot }` |

---

## ⚙️ Getting Started

### Prerequisites
```
Node.js   ≥ 18.x (22.x recommended)
Python    ≥ 3.9  (3.11 recommended)
npm       ≥ 9.x
pip       ≥ 23.x
PostgreSQL (or use Docker Compose, below)
```

### Option A — Docker Compose (recommended)
```bash
git clone https://github.com/obstinix/aerosync.git
cd aerosync
docker compose up --build
# Frontend → http://localhost:5173
# Backend  → http://localhost:3001
# AI Service → http://localhost:8000/docs
```

### Option B — Manual setup
```bash
# 1. Clone
git clone https://github.com/obstinix/aerosync.git && cd aerosync

# 2. Frontend
cd frontend && npm install && npm run dev      # → http://localhost:5173

# 3. Backend
cd backend && npm install
npx prisma migrate dev --name init && npx prisma db seed
npm start                                       # → http://localhost:3001

# 4. AI Service
cd ai-service && python -m venv venv
source venv/bin/activate                        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload                       # → http://localhost:8000/docs
```

---

## 🔐 Environment Variables

**`/backend/.env`**
```
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/aerosync
JWT_SECRET=your_secret_here
OPENSKY_USERNAME=optional_for_higher_rate_limit
OPENSKY_PASSWORD=optional_for_higher_rate_limit
```

**`/frontend/.env`**
```
VITE_BACKEND_URL=http://localhost:3001
VITE_AI_SERVICE_URL=http://localhost:8000
VITE_OPENWEATHER_KEY=your_key_here
```

**`/ai-service/.env`**
```
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
MODEL_PATH=./models/delay_rf_v1.pkl
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#000000` |
| Accent — cyan | `#00D4FF` |
| Warning — amber | `#FFB020` |
| Critical — red | `#FF4444` |
| Success — green | `#00C978` |
| Heading / body font | Space Grotesk |
| Data / mono font | JetBrains Mono |

A terminal/cinematic aesthetic by design — no glassmorphism, no generic gradients. Data values,
timestamps, and callsigns always render in JetBrains Mono; everything else in Space Grotesk.

---

## ☁️ Deployment

AeroSync deploys as **three independent Render Web Services** plus a managed PostgreSQL instance,
defined in `render.yaml`:

| Service | Root | Start Command |
|---|---|---|
| `aerosync-frontend` | `frontend/` | `npx serve dist -l 3000` |
| `aerosync-backend` | `backend/` | `npm start` |
| `aerosync-ai` | `ai-service/` | `uvicorn main:app --host 0.0.0.0 --port 8000` |

> Earlier prototypes served only a static frontend bundle with mock data; the current architecture
> runs all three services independently with real ADS-B data and persistent state.

---

## 🗺️ Roadmap

- [x] 3D WebGL globe with live arcs and moving aircraft markers
- [x] Indian airline/airport network (Air India, IndiGo, SpiceJet, Air Asia India)
- [x] AI War Room — streaming LLM recovery agent
- [x] PostgreSQL persistence (flights, cargo, alerts, predictions)
- [x] OpenSky Network live ADS-B integration
- [x] Cmd+K command palette, keyboard shortcuts, tooltip system
- [x] PDF / CSV export, historical analytics dashboard
- [ ] Multi-user collaborative scheduling sessions
- [ ] Role-based access control (dispatcher / cargo / read-only)
- [ ] AI model retrained on a real-world flight delay dataset
- [ ] Native mobile app
- [ ] Public API for third-party integrations

---

## 🤝 Contributing

AeroSync is open to contributions — whether that's a bug fix, a new feature, or design polish.

```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"      # Conventional Commits
git push origin feature/your-feature
# Open a Pull Request against main
```

Please keep PRs focused and scoped to a single change, and match the existing design system
(`#00D4FF` cyan accent, Space Grotesk + JetBrains Mono, no glassmorphism) unless a change is
explicitly about the visual system itself.

---

## 👥 Contributors

<a href="https://github.com/obstinix/aerosync/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=obstinix/aerosync" />
</a>

Currently maintained by [**obstinix**](https://github.com/obstinix). First-time contributors are
genuinely welcome — open an issue before a large PR so we can align on direction first.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ✈️ by [**obstinix**](https://github.com/obstinix)

React · Node.js · Python · FastAPI · Socket.IO · PostgreSQL · three-globe · Render

</div>

