import { create } from 'zustand';
import {
  generateFlights,
  generateAlerts,
  generateCargoManifests,
  generateAISuggestions,
} from './mockData';

const initialFlights = generateFlights(25);

const useStore = create((set, get) => ({
  // Flights
  flights: initialFlights,
  selectedFlight: null,
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
  clearSelectedFlight: () => set({ selectedFlight: null }),

  // Alerts
  alerts: generateAlerts(initialFlights),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 20),
    })),

  // Cargo
  cargoManifests: generateCargoManifests(initialFlights),

  // AI Suggestions
  aiSuggestions: generateAISuggestions(),

  // Notifications (toast)
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        { id: Date.now(), timestamp: new Date().toISOString(), ...notification },
        ...state.notifications,
      ].slice(0, 10),
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // Connection status
  isConnected: true,
  setConnected: (val) => set({ isConnected: val }),

  // Weather overlay
  showWeather: false,
  toggleWeather: () => set((state) => ({ showWeather: !state.showWeather })),

  // Stats computed
  getStats: () => {
    const flights = get().flights;
    const active = flights.filter((f) => ['in-flight', 'boarding', 'on-time'].includes(f.status)).length;
    const delayed = flights.filter((f) => f.status === 'delayed').length;
    const total = flights.length;
    const onTimePercent = total > 0 ? Math.round(((total - delayed) / total) * 100) : 0;
    const totalCargo = flights.reduce((sum, f) => sum + f.cargoWeight, 0);
    const totalMaxCargo = flights.reduce((sum, f) => sum + f.maxCargo, 0);
    const cargoUtilization = totalMaxCargo > 0 ? Math.round((totalCargo / totalMaxCargo) * 100) : 0;
    return { active, delayed, onTimePercent, cargoUtilization };
  },

  // Update a flight (used by WebSocket simulation)
  updateFlight: (flightId, updates) =>
    set((state) => ({
      flights: state.flights.map((f) =>
        f.id === flightId ? { ...f, ...updates } : f
      ),
      cargoManifests: state.cargoManifests.map((m) =>
        m.flightId === flightId
          ? { ...m, ...('cargoWeight' in updates ? { weight: updates.cargoWeight, utilization: Math.round((updates.cargoWeight / m.maxWeight) * 100) } : {}) }
          : m
      ),
    })),

  // Disruption simulation
  disruptions: [],
  injectDisruption: (disruption) => {
    const flights = get().flights;
    const affectedFlights = flights
      .filter(
        (f) =>
          f.origin === disruption.airport ||
          f.destination === disruption.airport
      )
      .map((f) => ({
        ...f,
        estimatedDelay: Math.floor(disruption.severity * (30 + Math.random() * 60)),
      }));

    set((state) => ({
      disruptions: [
        {
          id: `DIS-${Date.now()}`,
          ...disruption,
          affectedFlights,
          timestamp: new Date().toISOString(),
          totalDelays: affectedFlights.reduce((s, f) => s + f.estimatedDelay, 0),
          passengersAffected: affectedFlights.reduce((s, f) => s + f.passengers, 0),
          revenueImpact: affectedFlights.length * disruption.severity * 15000,
        },
        ...state.disruptions,
      ],
    }));
    return affectedFlights;
  },

  // Active screen
  activeScreen: 'dashboard',
  setActiveScreen: (screen) => set({ activeScreen: screen }),
}));

export default useStore;
