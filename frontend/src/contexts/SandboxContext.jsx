import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const SandboxContext = createContext(null);

/**
 * SandboxProvider — duplicates the scheduling state so users can edit
 * flight schedules locally (drag/reassign) without mutating real data.
 *
 * Exposes:
 *   - isSandbox:        boolean — whether sandbox mode is active
 *   - enterSandbox:     (flights) => void — enter sandbox with cloned flights
 *   - exitSandbox:      () => void — discard sandbox
 *   - sandboxFlights:   Flight[] — the editable sandbox copy
 *   - updateSandboxFlight: (id, updates) => void — edit one sandbox flight
 *   - diff:             { id, field, original, modified }[] — computed change list
 */
export function SandboxProvider({ children }) {
  const [isSandbox, setIsSandbox] = useState(false);
  const [originalFlights, setOriginalFlights] = useState([]);
  const [sandboxFlights, setSandboxFlights] = useState([]);

  const enterSandbox = useCallback((flights) => {
    setOriginalFlights(JSON.parse(JSON.stringify(flights)));
    setSandboxFlights(JSON.parse(JSON.stringify(flights)));
    setIsSandbox(true);
  }, []);

  const exitSandbox = useCallback(() => {
    setIsSandbox(false);
    setOriginalFlights([]);
    setSandboxFlights([]);
  }, []);

  const updateSandboxFlight = useCallback((flightId, updates) => {
    setSandboxFlights((prev) =>
      prev.map((f) => (f.id === flightId ? { ...f, ...updates } : f))
    );
  }, []);

  // Compute diff between original and sandbox flights
  const diff = useMemo(() => {
    if (!isSandbox) return [];
    const changes = [];
    const fieldsToCompare = ['scheduledDeparture', 'origin', 'destination', 'gate', 'aircraftType', 'status'];

    sandboxFlights.forEach((sf) => {
      const of = originalFlights.find((o) => o.id === sf.id);
      if (!of) return;
      fieldsToCompare.forEach((field) => {
        if (sf[field] !== of[field]) {
          changes.push({
            id: sf.id,
            field,
            original: of[field],
            modified: sf[field],
          });
        }
      });
    });
    return changes;
  }, [isSandbox, sandboxFlights, originalFlights]);

  return (
    <SandboxContext.Provider
      value={{
        isSandbox,
        enterSandbox,
        exitSandbox,
        sandboxFlights,
        updateSandboxFlight,
        diff,
      }}
    >
      {children}
    </SandboxContext.Provider>
  );
}

export const useSandbox = () => {
  const ctx = useContext(SandboxContext);
  if (!ctx) throw new Error('useSandbox must be used inside SandboxProvider');
  return ctx;
};

export default SandboxContext;
