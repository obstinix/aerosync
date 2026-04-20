import useStore from '../../store/useStore';

export default function FlightPopup() {
  const selectedFlight = useStore((s) => s.selectedFlight);
  const clearSelectedFlight = useStore((s) => s.clearSelectedFlight);

  if (!selectedFlight) return null;
  const f = selectedFlight;

  return (
    <div className="flight-popup">
      <div className="popup-header">
        <span className="popup-flight-id">{f.id}</span>
        <button className="popup-close" onClick={clearSelectedFlight}>✕</button>
      </div>
      <div className="popup-route">{f.originData?.city} → {f.destinationData?.city}</div>
      <div className="popup-row">
        <span className="popup-label">Status</span>
        <span className={`status-badge ${f.status}`}>{f.status}</span>
      </div>
      <div className="popup-row">
        <span className="popup-label">Route</span>
        <span className="popup-val">{f.origin} → {f.destination}</span>
      </div>
      <div className="popup-row">
        <span className="popup-label">Aircraft</span>
        <span className="popup-val">{f.aircraft}</span>
      </div>
      <div className="popup-row">
        <span className="popup-label">ETA</span>
        <span className="popup-val">{new Date(f.eta).toLocaleTimeString('en-US', { hour12: false })}</span>
      </div>
      <div className="popup-row">
        <span className="popup-label">Cargo</span>
        <span className="popup-val">{f.cargoWeight}t / {f.maxCargo}t</span>
      </div>
      {f.delay > 0 && (
        <div className="popup-row">
          <span className="popup-label">Delay</span>
          <span className="popup-val" style={{ color: '#FFB800' }}>+{f.delay} min</span>
        </div>
      )}
    </div>
  );
}
