import SchedulingBoard from '../components/SchedulingBoard/SchedulingBoard';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

export default function SchedulingPage() {
  return (
    <ErrorBoundary
      fallback={
        <div style={{
          padding: '24px', background: '#0d0d0d', border: '1px solid #FF4444',
          color: '#FF4444', fontFamily: 'var(--font-display)', fontSize: '11px',
          textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center'
        }}>
          <span>Scheduling Board Offline</span>
          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'block', margin: '12px auto 0', padding: '4px 8px',
              background: 'transparent', border: '1px solid #FF4444', color: '#FF4444',
              cursor: 'pointer', fontSize: '10px', fontFamily: 'var(--font-data)'
            }}
          >
            Re-Init Board
          </button>
        </div>
      }
    >
      <SchedulingBoard />
    </ErrorBoundary>
  );
}
