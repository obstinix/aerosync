<p align="center">
  <img src="docs/assets/aerosync-logo.png" alt="AeroSync Logo" width="120" />
</p>

<h1 align="center">✈️ AeroSync</h1>

<p align="center">
  <strong>Real-Time Airline & Cargo Scheduling Platform</strong><br/>
  Mission-critical operations dashboard for modern aviation logistics
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-00E5FF?style=flat-square" />
  <img src="https://img.shields.io/badge/version-1.0.0-FFB800?style=flat-square" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />
</p>

---

## 🌐 Overview

**AeroSync** is a real-time airline and cargo scheduling platform designed for aviation operations centers. It provides live flight tracking on a 3D globe, intelligent scheduling with AI-powered recommendations, cargo capacity management, and disruption impact simulation.

### Key Features

- 🌍 **Live Operations Dashboard** — 3D globe with animated flight arcs, weather overlays, and real-time alerts
- 📊 **Smart Scheduling Board** — Gantt-style drag-and-drop timeline with AI-powered reoptimization suggestions
- 📦 **Cargo Intelligence Panel** — Capacity utilization tracking, manifest management, route optimization
- ⚡ **Disruption Simulator** — Inject weather, technical, or security events and visualize cascading impacts
- 🔔 **Real-Time Updates** — WebSocket-powered live data with toast notifications
- 🎨 **Aviation Radar UI** — Dark mode glassmorphism design inspired by mission control interfaces

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, CesiumJS/Mapbox GL, Framer Motion |
| **Backend** | Node.js + Express, Socket.IO |
| **AI Service** | Python + FastAPI, scikit-learn |
| **Styling** | Vanilla CSS, Glassmorphism, JetBrains Mono |
| **Data** | Mock data with WebSocket simulation |

---

## 📁 Project Structure

```
aerosync/
├── README.md
├── .gitignore
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # UI components (Globe, SchedulingBoard, etc.)
│   │   ├── hooks/      # Custom React hooks
│   │   ├── pages/      # Page-level components
│   │   ├── store/      # State management
│   │   └── App.jsx     # Root component
├── backend/            # Node.js + Express + Socket.IO server
│   ├── server.js
│   ├── routes/
│   ├── sockets/
│   └── middleware/
├── ai-service/         # Python AI recommendation engine
│   ├── main.py
│   └── models/
└── docs/               # Documentation
    ├── PRD.md
    └── API_CONTRACTS.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/obstinix/aerosync.git
cd aerosync

# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup (new terminal)
cd backend
npm install
npm start

# AI Service setup (new terminal)
cd ai-service
pip install -r requirements.txt
python main.py
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
WS_PORT=3002
AI_SERVICE_URL=http://localhost:8000
```

---

## 📸 Screenshots

> Screenshots will be added as features are completed.

| Dashboard | Scheduling Board |
|-----------|-----------------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Scheduling](docs/screenshots/scheduling.png) |

| Cargo Panel | Disruption Sim |
|-------------|---------------|
| ![Cargo](docs/screenshots/cargo.png) | ![Disruption](docs/screenshots/disruption.png) |

---

## 🌿 Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready releases |
| `dev` | Active development integration |
| `feature/ui-dashboard` | Live Operations Dashboard |
| `feature/ai-engine` | AI recommendation engine & scheduling |
| `feature/cargo-panel` | Cargo intelligence & disruption sim |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ✈️ by <a href="https://github.com/obstinix">obstinix</a>
</p>
