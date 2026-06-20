import React, { useEffect, useRef, useState, useCallback } from 'react';
import Globe from 'globe.gl';

export default function Globe3D({ flights = [], airports = [], onAirportSelect, onFlightSelect }) {
  const containerRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [initError, setInitError] = useState(null);

  // WebGL detection
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglAvailable(false);
      }
    } catch (e) {
      setWebglAvailable(false);
    }
  }, []);

  const initGlobe = useCallback(() => {
    if (!webglAvailable || !containerRef.current) return;

    // Clear previous instance
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    globeInstanceRef.current = null;
    setInitError(null);

    try {
      // Initialize Globe
      const globe = Globe()(containerRef.current);
      globeInstanceRef.current = globe;

      // Configure globe — all method names audited against globe.gl API (case-sensitive)
      globe
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .atmosphereColor('#00D4FF')
        .atmosphereAltitude(0.15)
        .enablePointerInteraction(true);

      // Auto-rotate configuration
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
      }

      // Pause on user interaction, resume after 3s idle
      let idleTimeout;
      const onInteraction = () => {
        if (controls) {
          controls.autoRotate = false;
        }
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
          if (controls) {
            controls.autoRotate = true;
          }
        }, 3000);
      };

      containerRef.current.addEventListener('mousedown', onInteraction);
      containerRef.current.addEventListener('wheel', onInteraction);
      containerRef.current.addEventListener('touchstart', onInteraction);

      // Resize handler
      const resizeObserver = new ResizeObserver(() => {
        if (containerRef.current) {
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          globe.width(width).height(height);
        }
      });
      resizeObserver.observe(containerRef.current);

      // Store cleanup references
      globe.__cleanup = () => {
        clearTimeout(idleTimeout);
        resizeObserver.disconnect();
        if (containerRef.current) {
          containerRef.current.removeEventListener('mousedown', onInteraction);
          containerRef.current.removeEventListener('wheel', onInteraction);
          containerRef.current.removeEventListener('touchstart', onInteraction);
        }
      };

    } catch (err) {
      console.error('[Globe3D] Init failed:', err);
      setInitError(err.message || 'Unknown globe initialization error');
    }
  }, [webglAvailable]);

  useEffect(() => {
    initGlobe();
    return () => {
      const globe = globeInstanceRef.current;
      if (globe && globe.__cleanup) globe.__cleanup();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [initGlobe]);

  // Update data
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;

    try {
      // Map airports data — pointsData, pointColor, pointAltitude, pointRadius, pointLabel all canonical
      globe
        .pointsData(airports)
        .pointColor(() => '#00D4FF')
        .pointAltitude(0.01)
        .pointRadius(0.4)
        .pointLabel(d => `
          <div style="
            color:#00D4FF;
            font-family:'JetBrains Mono', monospace;
            background:rgba(10,10,10,0.85);
            border:1px solid rgba(0,212,255,0.25);
            padding:6px 10px;
            border-radius:4px;
            font-size:11px;
            pointer-events:none;
          ">
            ${d.name} (${d.iata || d.code})
          </div>
        `);

      if (onAirportSelect) {
        globe.onPointClick(airport => onAirportSelect(airport));
      }

      // Map flights to arcs
      const flightArcs = flights.map(flight => {
        const startAirport = airports.find(a => a.iata === flight.origin || a.code === flight.origin);
        const endAirport = airports.find(a => a.iata === flight.destination || a.code === flight.destination);
        if (!startAirport || !endAirport) return null;
        return {
          startLat: startAirport.lat,
          startLng: startAirport.lon || startAirport.lng,
          endLat: endAirport.lat,
          endLng: endAirport.lon || endAirport.lng,
          color: flight.status === 'delayed' ? '#FFB020' : flight.status === 'critical' ? '#FF4444' : '#00D4FF',
          flight
        };
      }).filter(Boolean);

      // arcsData, arcColor, arcDashLength, arcDashGap, arcDashAnimateTime — all canonical
      // FIX: arcAltitudeAutoScale (capital S) — was arcAltitudeAutoscale
      globe
        .arcsData(flightArcs)
        .arcColor(d => d.color)
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(1500)
        .arcAltitudeAutoScale(0.3)
        .arcLabel(d => `
          <div style="
            color:#F5F5F5;
            font-family:'JetBrains Mono', monospace;
            background:rgba(10,10,10,0.85);
            border:1px solid rgba(0,212,255,0.25);
            padding:6px 10px;
            border-radius:4px;
            font-size:11px;
            pointer-events:none;
          ">
            <strong>${d.flight.id}</strong><br/>
            ${d.flight.origin} &rarr; ${d.flight.destination}<br/>
            Status: ${d.flight.status}
          </div>
        `);

      if (onFlightSelect) {
        globe.onArcClick(arc => onFlightSelect(arc.flight));
      }
    } catch (err) {
      console.error('[Globe3D] Data update failed:', err);
      setInitError(err.message || 'Globe data update error');
    }
  }, [flights, airports, onAirportSelect, onFlightSelect]);

  // Globe init error fallback (separate from top-level ErrorBoundary)
  if (initError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        background: '#0A0A0A',
        border: '1px solid rgba(255, 68, 68, 0.4)',
        borderRadius: '6px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '10px',
          color: '#FF4444',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '8px',
        }}>
          ⚠ SYSTEM DEGRADED
        </div>
        <div style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: '13px',
          color: '#888',
          marginBottom: '16px',
          maxWidth: '320px',
          lineHeight: 1.5,
        }}>
          Globe renderer encountered an error: {initError}
        </div>
        <button
          onClick={() => { setInitError(null); initGlobe(); }}
          style={{
            padding: '6px 16px',
            background: 'transparent',
            border: '1px solid #00D4FF',
            borderRadius: '4px',
            color: '#00D4FF',
            cursor: 'pointer',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '11px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(0,212,255,0.1)'}
          onMouseLeave={e => e.target.style.background = 'transparent'}
        >
          ↻ Retry
        </button>
      </div>
    );
  }

  if (!webglAvailable) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        background: '#000000',
        border: '1px solid rgba(0, 212, 255, 0.25)',
        borderRadius: '6px',
        color: '#FFB020',
        fontFamily: '"Space Grotesk", sans-serif',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚠️</div>
        <div style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          3D Globe requires WebGL
        </div>
        <div style={{ fontSize: '11px', color: '#888', marginTop: '6px', fontFamily: '"JetBrains Mono", monospace' }}>
          Please enable WebGL in your browser settings to view the interactive airspace.
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#000000',
      }}
    />
  );
}
