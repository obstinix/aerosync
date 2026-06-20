import React, { useEffect, useRef, useState, useCallback } from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';
import { soundManager } from '../utils/soundManager';

function getSubsolarPoint() {
  const now = new Date();
  const start = new Date(now.getUTCFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const declination = 23.45 * Math.sin((2 * Math.PI * (dayOfYear - 80)) / 365);
  
  const totalHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const longitude = -15 * (totalHours - 12);
  
  return { lat: declination, lng: longitude };
}

function createTerminatorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0.65)');
  grad.addColorStop(0.22, 'rgba(0,0,0,0.65)');
  grad.addColorStop(0.33, 'rgba(0,0,0,0)');
  grad.addColorStop(0.67, 'rgba(0,0,0,0)');
  grad.addColorStop(0.78, 'rgba(0,0,0,0.65)');
  grad.addColorStop(1, 'rgba(0,0,0,0.65)');
  
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function getAircraftPosition(startLat, startLng, endLat, endLng, t) {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const endLatRad = (endLat * Math.PI) / 180;
  const endLngRad = (endLng * Math.PI) / 180;
  
  const pStart = new THREE.Vector3(
    Math.cos(startLatRad) * Math.sin(startLngRad),
    Math.sin(startLatRad),
    Math.cos(startLatRad) * Math.cos(startLngRad)
  );
  
  const pEnd = new THREE.Vector3(
    Math.cos(endLatRad) * Math.sin(endLngRad),
    Math.sin(endLatRad),
    Math.cos(endLatRad) * Math.cos(endLngRad)
  );
  
  const pCurr = new THREE.Vector3().copy(pStart).lerp(pEnd, t).normalize();
  
  const lat = Math.asin(pCurr.y) * (180 / Math.PI);
  const lng = Math.atan2(pCurr.x, pCurr.z) * (180 / Math.PI);
  const alt = 0.08 * 4 * t * (1 - t); // altitude in units of radius
  
  return { lat, lng, alt };
}

function getBearing(lat1, lng1, lat2, lng2) {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  const bearing = Math.atan2(y, x);
  return bearing;
}

export default function Globe3D({ flights = [], airports = [], onAirportSelect, onFlightSelect }) {
  const containerRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [initError, setInitError] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

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

      // Add day/night terminator overlay
      const terminatorGeometry = new THREE.SphereGeometry(100.15, 64, 64);
      const terminatorTexture = createTerminatorTexture();
      const terminatorMaterial = new THREE.MeshBasicMaterial({
        map: terminatorTexture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const terminatorMesh = new THREE.Mesh(terminatorGeometry, terminatorMaterial);

      const updateTerminatorRotation = () => {
        const { lat, lng } = getSubsolarPoint();
        const latRad = (lat * Math.PI) / 180;
        const lngRad = (lng * Math.PI) / 180;
        const R = 100.15;
        const sunPos = new THREE.Vector3(
          R * Math.cos(latRad) * Math.sin(lngRad),
          R * Math.sin(latRad),
          R * Math.cos(latRad) * Math.cos(lngRad)
        );
        terminatorMesh.lookAt(sunPos);
      };

      updateTerminatorRotation();
      globe.scene().add(terminatorMesh);
      const terminatorInterval = setInterval(updateTerminatorRotation, 30000);

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
        clearInterval(terminatorInterval);
        resizeObserver.disconnect();
        if (containerRef.current) {
          containerRef.current.removeEventListener('mousedown', onInteraction);
          containerRef.current.removeEventListener('wheel', onInteraction);
          containerRef.current.removeEventListener('touchstart', onInteraction);
        }
        try {
          globe.scene().remove(terminatorMesh);
          terminatorGeometry.dispose();
          terminatorTexture.dispose();
          terminatorMaterial.dispose();
        } catch (e) {
          console.error('[Globe3D] Error disposing terminator:', e);
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

  // Control Tower view easter egg
  useEffect(() => {
    const handleTowerView = () => {
      const globe = globeInstanceRef.current;
      if (!globe) return;
      
      soundManager.playWhoosh();
      globe.pointOfView({ lat: 28.556, lng: 77.100, altitude: 0.005 }, 3000);
      
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = false;
      }
    };
    
    window.addEventListener('trigger-tower-view', handleTowerView);
    return () => window.removeEventListener('trigger-tower-view', handleTowerView);
  }, []);

  // India delay heatmap points (lat 6-37, lon 68-97)
  const heatmapPoints = useMemo(() => {
    if (!showHeatmap) return [];
    const points = [];
    
    flights.forEach(flight => {
      const startAp = airports.find(a => a.code === flight.origin || a.iata === flight.origin);
      const endAp = airports.find(a => a.code === flight.destination || a.iata === flight.destination);
      if (!startAp || !endAp) return;
      
      const t = flight.progressPct || 0;
      const startLat = startAp.lat;
      const startLng = startAp.lon || startAp.lng;
      const endLat = endAp.lat;
      const endLng = endAp.lon || endAp.lng;
      
      const pos = getAircraftPosition(startLat, startLng, endLat, endLng, t);
      
      if (pos.lat >= 6 && pos.lat <= 37 && pos.lng >= 68 && pos.lng <= 97) {
        if (flight.delayMinutes > 0) {
          points.push({
            lat: pos.lat,
            lng: pos.lng,
            delay: flight.delayMinutes
          });
        }
      }
    });
    
    return points;
  }, [flights, airports, showHeatmap]);

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

      // Map active flights to moving aircraft objects
      const activeFlightsData = flights.map(flight => {
        const startAirport = airports.find(a => a.iata === flight.origin || a.code === flight.origin);
        const endAirport = airports.find(a => a.iata === flight.destination || a.code === flight.destination);
        if (!startAirport || !endAirport) return null;
        
        const t = flight.progressPct || 0;
        if (t <= 0 || t >= 1) return null;

        const startLat = startAirport.lat;
        const startLng = startAirport.lon || startAirport.lng;
        const endLat = endAirport.lat;
        const endLng = endAirport.lon || endAirport.lng;

        const pos = getAircraftPosition(startLat, startLng, endLat, endLng, t);

        return {
          flight,
          lat: pos.lat,
          lng: pos.lng,
          alt: pos.alt,
          bearingStartLat: pos.lat,
          bearingStartLng: pos.lng,
          bearingEndLat: endLat,
          bearingEndLng: endLng
        };
      }).filter(Boolean);

      globe
        .objectsData(activeFlightsData)
        .objectLat(d => d.lat)
        .objectLng(d => d.lng)
        .objectAltitude(d => d.alt)
        .objectThreeObject(d => {
          const group = new THREE.Group();
          const color = d.flight.status === 'delayed' ? '#FFB020' : d.flight.status === 'critical' ? '#FF4444' : '#00D4FF';
          const mat = new THREE.MeshBasicMaterial({ color });
          
          const coneGeom = new THREE.ConeGeometry(0.8, 3, 4);
          coneGeom.rotateX(Math.PI / 2);
          const body = new THREE.Mesh(coneGeom, mat);
          group.add(body);
          
          const wingGeom = new THREE.BoxGeometry(3, 0.1, 0.6);
          const wing = new THREE.Mesh(wingGeom, mat);
          group.add(wing);
          
          return group;
        })
        .objectThreeObjectUpdate((obj, d) => {
          const bearing = getBearing(d.bearingStartLat, d.bearingStartLng, d.bearingEndLat, d.bearingEndLng);
          obj.rotation.z = -bearing;
        })
        .objectLabel(d => `
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
            Route: ${d.flight.origin} &rarr; ${d.flight.destination}<br/>
            Progress: ${Math.round((d.flight.progressPct || 0) * 100)}%
          </div>
        `);

      if (onFlightSelect) {
        globe.onObjectClick(obj => onFlightSelect(obj.flight));
      }

      // India delay heatmap points layer
      globe
        .hexBinPointsData(heatmapPoints)
        .hexBinPointLat(d => d.lat)
        .hexBinPointLng(d => d.lng)
        .hexBinPointWeight(d => d.delay)
        .hexBinRadius(1.2)
        .hexColor(() => '#FFB020')
        .hexAltitude(d => Math.min(0.5, d.sumWeight * 0.003))
        .hexLabel(d => `
          <div style="
            color:#FFB020;
            font-family:'JetBrains Mono', monospace;
            background:rgba(10,10,10,0.85);
            border:1px solid rgba(255,176,32,0.25);
            padding:6px 10px;
            border-radius:4px;
            font-size:11px;
            pointer-events:none;
          ">
            <strong>INDIA DELAY HOTSPOT</strong><br/>
            Flights: ${d.points.length}<br/>
            Total Delay: ${d.sumWeight} mins
          </div>
        `);
    } catch (err) {
      console.error('[Globe3D] Data update failed:', err);
      setInitError(err.message || 'Globe data update error');
    }
  }, [flights, airports, onAirportSelect, onFlightSelect, heatmapPoints]);

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
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
      
      {/* Heatmap Toggle Button */}
      <button
        onClick={() => setShowHeatmap(prev => !prev)}
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 10,
          background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${showHeatmap ? '#FFB020' : '#00D4FF'}`,
          borderRadius: '4px',
          color: showHeatmap ? '#FFB020' : '#00D4FF',
          padding: '6px 12px',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '11px',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          transition: 'all 0.15s ease-out',
          boxShadow: showHeatmap ? '0 0 10px rgba(255,176,32,0.25)' : 'none',
        }}
      >
        {showHeatmap ? '🔥 HEATMAP: ON (INDIA)' : '🛢️ HEATMAP: OFF'}
      </button>
    </div>
  );
}
