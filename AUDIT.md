# Audit — 2026-06-13

## Working
- React frontend project runs with Vite, React 19, and TailwindCSS (index.css has tailwind imports or custom CSS, let's verify).
- Page navigation shell and routing (DashboardPage, SchedulingPage, CargoPage, DisruptionPage) are responsive.
- Express server runs on port 3001 with routing modules.
- FastAPI server runs on port 8000.
- Socket.IO connection boilerplate on backend.

## Broken / Not Deployed
- Frontend's WebSocket mock `useWebSocket.js` doesn't connect to backend Socket.IO; it simulates status changes locally.
- Backend socket server is not connected to a database, and the frontend doesn't listen to its messages.
- CommonJS imports in backend do not match ES Modules structure used by workspaces.

## Fake (mock/hardcoded)
- All flights, alerts, and cargo data is generated dynamically inside `frontend/src/store/mockData.js` and managed in Zustand.
- Disruption cascades and calculations are performed on the client.
- AI Service delay predictor outputs random predictions in FastAPI routes.
- Python ML models are placeholders.

## Missing
- Database layer (SQLite + Drizzle ORM).
- Real tables and database schema for flights, cargo, disruptions, and alerts.
- Seed data for flights and cargo.
- Real cascade logic in backend routing for disruptions.
- Input validation (Zod) on flights PATCH route.
- Modern visual styling with DesignMD tokens and Motion.dev.
