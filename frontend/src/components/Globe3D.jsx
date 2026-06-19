import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';

export default function Globe3D({ flights = [], airports = [], onAirportSelect, onFlightSelect }) {
  const containerRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const [webglAvailable, setWebglAvailable] = useState(true);

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

  useEffect(() => {
    if (!webglAvailable || !containerRef.current) return;

    // Initialize Globe
    const globe = Globe()(containerRef.current);
    globeInstanceRef.current = globe;

    // Configure globe
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
      controls.autoRotateSpeed = 0.3; // 0.3 deg/s
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

    return () => {
      clearTimeout(idleTimeout);
      resizeObserver.disconnect();
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousedown', onInteraction);
        containerRef.current.removeEventListener('wheel', onInteraction);
        containerRef.current.removeEventListener('touchstart', onInteraction);
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [webglAvailable]);

  // Update data
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;

    // Map airports data
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

    globe
      .arcsData(flightArcs)
      .arcColor(d => d.color)
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(1500)
      .arcAltitudeAutoscale(0.3)
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
  }, [flights, airports, onAirportSelect, onFlightSelect]);

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
