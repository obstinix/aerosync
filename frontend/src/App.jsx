import useStore from './store/useStore';
import useWebSocket from './hooks/useWebSocket';
import TopNav from './components/shared/TopNav';
import ToastContainer from './components/shared/ToastContainer';
import DashboardPage from './pages/DashboardPage';
import SchedulingPage from './pages/SchedulingPage';
import CargoPage from './pages/CargoPage';
import DisruptionPage from './pages/DisruptionPage';

function ScreenRouter() {
  const activeScreen = useStore((s) => s.activeScreen);
  switch (activeScreen) {
    case 'dashboard': return <DashboardPage />;
    case 'scheduling': return <SchedulingPage />;
    case 'cargo': return <CargoPage />;
    case 'disruption': return <DisruptionPage />;
    default: return <DashboardPage />;
  }
}

export default function App() {
  useWebSocket();

  return (
    <div className="app-layout">
      <TopNav />
      <ScreenRouter />
      <ToastContainer />
    </div>
  );
}
