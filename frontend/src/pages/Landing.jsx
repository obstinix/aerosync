import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Globe3D from '../components/Globe3D';
import { AIRPORTS } from '../store/mockData';
import { INDIAN_FLIGHTS } from '../data/indianFlights';

function AnimatedCounter({ end, duration = 1500, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
}

export default function Landing() {
  const navigate = useNavigate();
  
  const handleEnter = () => {
    sessionStorage.setItem('onboarded', '1');
    navigate('/operations');
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      background: '#000000',
      color: '#F5F5F5',
      fontFamily: '"Space Grotesk", sans-serif',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      {/* Background Globe Container (Low Opacity) */}
      <div className="landing-globe-container" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.35,
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <Globe3D flights={[]} airports={Object.values(AIRPORTS)} />
      </div>

      {/* Top Header / Minimal Nav */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 40px',
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#00D4FF',
          letterSpacing: '0.15em',
          fontFamily: '"Space Grotesk", sans-serif',
        }}>
          AEROSYNC
        </div>
        <button 
          onClick={handleEnter}
          style={{
            background: 'transparent',
            border: '1px solid rgba(0, 212, 255, 0.4)',
            borderRadius: '4px',
            color: '#00D4FF',
            padding: '8px 20px',
            fontSize: '12px',
            fontFamily: '"JetBrains Mono", monospace',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 212, 255, 0.08)';
            e.target.style.borderColor = '#00D4FF';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.borderColor = 'rgba(0, 212, 255, 0.4)';
          }}
        >
          SIGN IN
        </button>
      </header>

      {/* Hero Body Content */}
      <main style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '800px',
        padding: '0 40px',
        margin: 'auto 0',
      }}>
        <h1 style={{
          fontSize: '56px',
          fontWeight: 700,
          lineHeight: '1.1',
          letterSpacing: '-0.02em',
          marginBottom: '20px',
          color: '#e8e6e0',
          textTransform: 'uppercase',
        }}>
          Real-time aviation intelligence <br />
          <span style={{ color: '#00D4FF' }}>for Indian airspace</span>
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#888',
          marginBottom: '32px',
          maxWidth: '560px',
          fontFamily: '"Space Grotesk", sans-serif',
        }}>
          AI-powered operations, disruption mitigation, and live metrics for <span style={{ color: '#FF6F00' }}>Air India</span>, <span style={{ color: '#002F6C' }}>IndiGo</span>, and <span style={{ color: '#ED1C24' }}>SpiceJet</span>.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={handleEnter}
            style={{
              background: '#00D4FF',
              border: 'none',
              borderRadius: '4px',
              color: '#000000',
              padding: '14px 28px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: '"JetBrains Mono", monospace',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 15px rgba(0, 212, 255, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#00b8e6';
              e.target.style.boxShadow = '0 0 25px rgba(0, 212, 255, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#00D4FF';
              e.target.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.25)';
            }}
          >
            ENTER MISSION CONTROL &rarr;
          </button>
          <button
            onClick={handleEnter}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              color: '#F5F5F5',
              padding: '14px 28px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: '"JetBrains Mono", monospace',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.08)';
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.03)';
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            VIEW DEMO
          </button>
        </div>
      </main>

      {/* Footer Live Right Now Metrics */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        padding: '40px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}>
        <div style={{
          fontSize: '11px',
          fontFamily: '"JetBrains Mono", monospace',
          color: '#555555',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4FF', display: 'inline-block' }}></span>
          Live Right Now
        </div>

        {/* 4 Stat Counters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
        }} className="landing-stats-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 700, color: '#00D4FF', fontFamily: '"JetBrains Mono", monospace' }}>
              <AnimatedCounter end={INDIAN_FLIGHTS.length} />
            </span>
            <span style={{ fontSize: '11px', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Flights
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 700, color: '#F5F5F5', fontFamily: '"JetBrains Mono", monospace' }}>
              <AnimatedCounter end={Object.keys(AIRPORTS).length} />
            </span>
            <span style={{ fontSize: '11px', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Airports
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 700, color: '#FF4444', fontFamily: '"JetBrains Mono", monospace' }}>
              <AnimatedCounter end={3} />
            </span>
            <span style={{ fontSize: '11px', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Alerts
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 700, color: '#FFB020', fontFamily: '"JetBrains Mono", monospace' }}>
              <AnimatedCounter end={17} suffix=" min" />
            </span>
            <span style={{ fontSize: '11px', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Avg Delay
            </span>
          </div>
        </div>
      </footer>

      {/* Styled Responsive Styling */}
      <style>{`
        @media (max-width: 768px) {
          .landing-globe-container {
            display: none !important;
          }
          .landing-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          main h1 {
            font-size: 36px !important;
          }
        }
      `}</style>
    </div>
  );
}
