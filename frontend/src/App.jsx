import { AnimatePresence, motion } from 'motion/react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Navbar } from './components/shared/Navbar.jsx';
import { Sidebar } from './components/shared/Sidebar.jsx';
import { ErrorBoundary } from './components/shared/ErrorBoundary.jsx';
import { SocketProvider } from './providers/SocketProvider.jsx';
import './styles/tokens.css';
import './App.css';

// Lazy load each page — CesiumJS is 2MB, don't load it upfront
const Dashboard   = lazy(() => import('./pages/DashboardPage.jsx'));
const Scheduling  = lazy(() => import('./pages/SchedulingPage.jsx'));
const CargoPanel  = lazy(() => import('./pages/CargoPage.jsx'));
const Simulator   = lazy(() => import('./pages/DisruptionPage.jsx'));
const Analytics   = lazy(() => import('./pages/Analytics.jsx'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', color: 'var(--c-muted)', fontFamily: 'var(--font-data)',
    fontSize: 'var(--text-sm)', letterSpacing: '0.1em' }}>
    LOADING MODULE...
  </div>
);

// Motion page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.14 } },
};

export default function App() {
  const location = useLocation();
  return (
    <SocketProvider>
      <div className="app-shell" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#000000',
        color: '#F5F5F5',
        fontFamily: '"Space Grotesk", sans-serif',
        overflow: 'hidden',
      }}>
        <Navbar />
        <div className="app-body" style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          paddingTop: 48,
        }}>
          <Sidebar />
          <main className="app-main" style={{
            flex: 1,
            overflowY: 'auto',
            position: 'relative',
          }}>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={
                      <motion.div {...pageVariants} style={{ height: '100%' }}>
                        <Dashboard />
                      </motion.div>
                    } />
                    <Route path="/scheduling" element={
                      <motion.div {...pageVariants} style={{ height: '100%' }}>
                        <Scheduling />
                      </motion.div>
                    } />
                    <Route path="/cargo" element={
                      <motion.div {...pageVariants} style={{ height: '100%' }}>
                        <CargoPanel />
                      </motion.div>
                    } />
                    <Route path="/simulator" element={
                      <motion.div {...pageVariants} style={{ height: '100%' }}>
                        <Simulator />
                      </motion.div>
                    } />
                    <Route path="/analytics" element={
                      <motion.div {...pageVariants} style={{ height: '100%' }}>
                        <Analytics />
                      </motion.div>
                    } />
                  </Routes>
                </AnimatePresence>
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </SocketProvider>
  );
}
