import { AnimatePresence, motion } from 'motion/react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Suspense, lazy, useState } from 'react';
import { Navbar } from './components/shared/Navbar.jsx';
import { Sidebar } from './components/shared/Sidebar.jsx';
import { ErrorBoundary } from './components/shared/ErrorBoundary.jsx';
import { SocketProvider } from './providers/SocketProvider.jsx';
import { SandboxProvider } from './contexts/SandboxContext.jsx';
import { useEffect } from 'react';
import SolariTicker from './components/SolariTicker.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import { KeyboardShortcuts, useKeyboardShortcuts } from './components/KeyboardShortcuts.jsx';
import ToastManager from './components/ToastManager.jsx';
import MorningBriefing from './components/MorningBriefing.jsx';
import './styles/tokens.css';
import './App.css';

// Lazy load each page — CesiumJS is 2MB, don't load it upfront
const Landing     = lazy(() => import('./pages/Landing.jsx'));
const Dashboard   = lazy(() => import('./pages/DashboardPage.jsx'));
const Scheduling  = lazy(() => import('./pages/SchedulingPage.jsx'));
const CargoPanel  = lazy(() => import('./pages/CargoPage.jsx'));
const Simulator   = lazy(() => import('./pages/DisruptionPage.jsx'));
const Analytics   = lazy(() => import('./pages/Analytics.jsx'));
const WarRoom     = lazy(() => import('./pages/WarRoom.jsx'));

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

function RouteFallback({ page }) {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      background: '#000000',
      fontFamily: '"Space Grotesk", sans-serif',
      padding: '40px',
    }}>
      <div style={{
        background: '#080808',
        border: '1px solid #FF4444',
        borderRadius: '6px',
        padding: '32px 40px',
        maxWidth: '480px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(255, 68, 68, 0.1)',
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '11px',
          color: '#FF4444',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '12px',
        }}>
          ⚠ operational failure
        </div>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#F5F5F5',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}>
          {page} Page hit an error
        </h2>
        <p style={{
          fontSize: '13px',
          color: '#888888',
          fontFamily: '"Space Grotesk", sans-serif',
          marginBottom: '24px',
          lineHeight: '1.5',
        }}>
          A critical exception was caught in the user interface thread. The exception details have been output to the developer console.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #00D4FF',
              borderRadius: '4px',
              color: '#00D4FF',
              cursor: 'pointer',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(0,212,255,0.08)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              color: '#F5F5F5',
              cursor: 'pointer',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(255,255,255,0.05)';
              e.target.style.borderColor = 'rgba(255,255,255,0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLanding = location.pathname === '/';

  // Global keyboard shortcuts
  const { isOpen: shortcutsOpen, close: closeShortcuts } = useKeyboardShortcuts();

  useEffect(() => {
    let typed = '';
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      typed += e.key.toUpperCase();
      if (typed.endsWith('TOWER')) {
        window.dispatchEvent(new CustomEvent('trigger-tower-view'));
        typed = '';
      }
      if (typed.length > 20) typed = typed.substring(typed.length - 10);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (location.pathname === '/' && sessionStorage.getItem('onboarded') === '1') {
      navigate('/operations');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const login = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001';
        const res = await fetch(`${API_URL}/api/auth/demo-login`, { method: 'POST' });
        if (res.ok) {
          const { token } = await res.json();
          localStorage.setItem('aerosync_token', token);
          console.log('[Auth] Demo login success, token cached.');
        }
      } catch (err) {
        console.error('[Auth] Demo login error:', err);
      }
    };
    login();
  }, []);

  return (
    <SocketProvider>
    <SandboxProvider>
      <div className="app-shell" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#000000',
        color: '#F5F5F5',
        fontFamily: '"Space Grotesk", sans-serif',
        overflow: 'hidden',
      }}>
        {!isLanding && <Navbar />}
        {!isLanding && <SolariTicker />}
        <div className="app-body" style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          paddingTop: isLanding ? 0 : 96, /* 48px navbar + 48px solari ticker */
        }}>
          {!isLanding && <Sidebar />}
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
                      <ErrorBoundary fallback={<RouteFallback page="Landing" />}>
                        <motion.div {...pageVariants} style={{ height: '100%' }}>
                          <Landing />
                        </motion.div>
                      </ErrorBoundary>
                    } />
                    <Route path="/operations" element={
                      <ErrorBoundary fallback={<RouteFallback page="Operations" />}>
                        <motion.div {...pageVariants} style={{ height: '100%' }}>
                          <Dashboard />
                        </motion.div>
                      </ErrorBoundary>
                    } />
                    <Route path="/scheduling" element={
                      <ErrorBoundary fallback={<RouteFallback page="Scheduling" />}>
                        <motion.div {...pageVariants} style={{ height: '100%' }}>
                          <Scheduling />
                        </motion.div>
                      </ErrorBoundary>
                    } />
                    <Route path="/cargo" element={
                      <ErrorBoundary fallback={<RouteFallback page="Cargo" />}>
                        <motion.div {...pageVariants} style={{ height: '100%' }}>
                          <CargoPanel />
                        </motion.div>
                      </ErrorBoundary>
                    } />
                    <Route path="/simulator" element={
                      <ErrorBoundary fallback={<RouteFallback page="Simulator" />}>
                        <motion.div {...pageVariants} style={{ height: '100%' }}>
                          <Simulator />
                        </motion.div>
                      </ErrorBoundary>
                    } />
                    <Route path="/analytics" element={
                      <ErrorBoundary fallback={<RouteFallback page="Analytics" />}>
                        <motion.div {...pageVariants} style={{ height: '100%' }}>
                          <Analytics />
                        </motion.div>
                      </ErrorBoundary>
                    } />
                    <Route path="/warroom" element={
                      <ErrorBoundary fallback={<RouteFallback page="War Room" />}>
                        <motion.div {...pageVariants} style={{ height: '100%' }}>
                          <WarRoom />
                        </motion.div>
                      </ErrorBoundary>
                    } />
                  </Routes>
                </AnimatePresence>
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>

        {/* Global overlays */}
        <ToastManager />
        <MorningBriefing />
        <CommandPalette />
        <KeyboardShortcuts isOpen={shortcutsOpen} onClose={closeShortcuts} />
      </div>
    </SandboxProvider>
    </SocketProvider>
  );
}

