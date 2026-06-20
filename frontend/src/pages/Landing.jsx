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
      {/* Background Globe Container (Single verified Globe3D instance to prevent duplicate/failing mounts) */}
      <div className="landing-globe-container" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.8,
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
        <div style={{
          fontSize: '15px',
          color: '#888',
          marginBottom: '32px',
          maxWidth: '620px',
          fontFamily: '"Space Grotesk", sans-serif',
          lineHeight: '1.6',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
        }}>
          AI-powered operations, disruption mitigation, and live metrics for:
          <span style={{ display: 'inline-flex', gap: '6px' }}>
            <span style={{ border: '1px solid #FF4444', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', color: '#FF4444', background: 'rgba(255,68,68,0.08)' }}>Air India</span>
            <span style={{ border: '1px solid #00D4FF', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', color: '#00D4FF', background: 'rgba(0,212,255,0.08)' }}>IndiGo</span>
            <span style={{ border: '1px solid #FFB020', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', color: '#FFB020', background: 'rgba(255,176,32,0.08)' }}>SpiceJet</span>
          </span>
        </div>

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
        padding: '0 40px 40px 40px',
      }}>
        <div style={{
          background: '#080808',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '6px',
          padding: '24px 32px',
        }}>
          <div style={{
            fontSize: '11px',
            fontFamily: '"JetBrains Mono", monospace',
            color: '#888888',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4FF', display: 'inline-block', boxShadow: '0 0 8px #00D4FF' }}></span>
            Telemetry Feed: Live Right Now
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

          {/* AI Network Briefing row */}
          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(0, 212, 255, 0.15)',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '11px',
            color: '#666666',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '4px',
          }}>
            <span style={{ color: '#888888' }}>NETWORK BRIEFING — </span>
            <span style={{ color: '#00D4FF' }}>6 ON-TIME</span>
            <span style={{ color: '#666666', margin: '0 4px' }}>·</span>
            <span style={{ color: '#FFB020' }}>3 DELAYED</span>
            <span style={{ color: '#666666', margin: '0 4px' }}>·</span>
            <span style={{ color: '#FF4444' }}>1 CRITICAL</span>
            <span style={{ color: '#666666', margin: '0 4px' }}>·</span>
            <span style={{ color: '#F5F5F5' }}>1,710 PAX TRACKED</span>
            <span style={{ color: '#666666', margin: '0 4px' }}>·</span>
            <span style={{ color: '#FF4444' }}>4 ALERTS PENDING</span>
            <button
              onClick={() => navigate('/warroom')}
              style={{
                background: 'none',
                border: 'none',
                color: '#00D4FF',
                cursor: 'pointer',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '13px',
                fontWeight: 'bold',
                padding: '0 4px',
                marginLeft: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.target.style.color = '#00D4FF'}
            >
              &rarr;
            </button>
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
