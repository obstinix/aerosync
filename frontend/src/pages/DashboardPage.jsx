import GlobeView from '../components/Globe/GlobeView';
import AlertsPanel from '../components/Globe/AlertsPanel';
import FlightPopup from '../components/Globe/FlightPopup';
import AnimatedCounter from '../components/shared/AnimatedCounter';
import useFlightData from '../hooks/useFlightData';

export default function DashboardPage() {
  const { stats } = useFlightData();

  return (
    <>
      <div className="screen-container">
        <GlobeView />
        <AlertsPanel />
        <FlightPopup />
      </div>
      <div className="hud-strip">
        <div className="stat-tile">
          <span className="stat-label">Active Flights</span>
          <AnimatedCounter value={stats.active} className="stat-value cyan" />
        </div>
        <div className="stat-tile">
          <span className="stat-label">Delayed</span>
          <AnimatedCounter value={stats.delayed} className="stat-value amber" />
        </div>
        <div className="stat-tile">
          <span className="stat-label">On-Time %</span>
          <AnimatedCounter value={stats.onTimePercent} className="stat-value green" />
        </div>
        <div className="stat-tile">
          <span className="stat-label">Cargo Utilization</span>
          <AnimatedCounter value={stats.cargoUtilization} className="stat-value cyan" />
        </div>
      </div>
    </>
  );
}
