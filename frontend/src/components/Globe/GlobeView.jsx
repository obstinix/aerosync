import { useRef, useEffect, useCallback } from 'react';
import useStore from '../../store/useStore';
import { AIRPORTS, STORM_ZONES } from '../../store/mockData';

function lerp(a, b, t) { return a + (b - a) * t; }

function toRad(deg) { return (deg * Math.PI) / 180; }
function toDeg(rad) { return (rad * 180) / Math.PI; }

function project(lat, lng, cx, cy, r) {
  const x = cx + r * toRad(lng) * Math.cos(toRad(lat));
  const y = cy - r * toRad(lat);
  return { x, y };
}

function getArcPoints(lat1, lng1, lat2, lng2, cx, cy, r, segments = 40) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = lerp(lat1, lat2, t);
    const lng = lerp(lng1, lng2, t);
    const arc = Math.sin(t * Math.PI) * 15;
    const p = project(lat, lng, cx, cy, r);
    points.push({ x: p.x, y: p.y - arc });
  }
  return points;
}

export default function GlobeView() {
  const canvasRef = useRef(null);
  const flights = useStore((s) => s.flights);
  const showWeather = useStore((s) => s.showWeather);
  const toggleWeather = useStore((s) => s.toggleWeather);
  const setSelectedFlight = useStore((s) => s.setSelectedFlight);
  const animRef = useRef(0);
  const flightArcsRef = useRef([]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.7;
    const time = performance.now() / 1000;

    // Background
    ctx.fillStyle = '#0A0F1E';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
    ctx.lineWidth = 0.5;
    for (let lat = -80; lat <= 80; lat += 20) {
      ctx.beginPath();
      for (let lng = -180; lng <= 180; lng += 2) {
        const p = project(lat, lng, cx, cy, r);
        lng === -180 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    for (let lng = -180; lng <= 180; lng += 30) {
      ctx.beginPath();
      for (let lat = -80; lat <= 80; lat += 2) {
        const p = project(lat, lng, cx, cy, r);
        lat === -80 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Weather zones
    if (showWeather) {
      STORM_ZONES.forEach((storm) => {
        const p = project(storm.center[0], storm.center[1], cx, cy, r);
        const sr = storm.radius * r * 0.008;
        const pulse = 1 + Math.sin(time * 2 + storm.center[0]) * 0.15;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sr * pulse);
        const color = storm.severity === 'severe' ? '255,61,90' : storm.severity === 'moderate' ? '255,184,0' : '0,229,255';
        grad.addColorStop(0, `rgba(${color}, 0.35)`);
        grad.addColorStop(0.5, `rgba(${color}, 0.15)`);
        grad.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, sr * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${color}, 0.7)`;
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(storm.name, p.x, p.y + sr * pulse + 14);
      });
    }

    // Airport dots
    Object.values(AIRPORTS).forEach((ap) => {
      const p = project(ap.lat, ap.lng, cx, cy, r);
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 12);
      glow.addColorStop(0, 'rgba(0, 229, 255, 0.6)');
      glow.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
      ctx.font = '600 11px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(ap.code, p.x, p.y - 12);
    });

    // Flight arcs
    const arcsData = [];
    flights.forEach((flight) => {
      const o = flight.originData;
      const d = flight.destinationData;
      if (!o || !d) return;

      const points = getArcPoints(o.lat, o.lng, d.lat, d.lng, cx, cy, r);
      const statusColor = flight.status === 'delayed' ? '#FFB800' : flight.status === 'cancelled' ? '#FF3D5A' : '#00E5FF';
      const alpha = flight.status === 'cancelled' ? 0.2 : 0.5;

      // Arc line
      ctx.strokeStyle = statusColor;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Moving dot
      if (flight.status === 'in-flight' || flight.status === 'on-time') {
        const progress = ((time * 0.08 + flight.id.charCodeAt(2) * 0.1) % 1);
        const dotIdx = Math.floor(progress * (points.length - 1));
        const dot = points[dotIdx];
        if (dot) {
          const dGlow = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, 8);
          dGlow.addColorStop(0, statusColor);
          dGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = dGlow;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = statusColor;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Store arc bounding for click detection
      const midIdx = Math.floor(points.length / 2);
      const mid = points[midIdx];
      arcsData.push({ flight, midX: mid.x, midY: mid.y });
    });

    flightArcsRef.current = arcsData;
    animRef.current = requestAnimationFrame(draw);
  }, [flights, showWeather]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (const arc of flightArcsRef.current) {
      const dx = mx - arc.midX;
      const dy = my - arc.midY;
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        setSelectedFlight(arc.flight);
        return;
      }
    }
  };

  return (
    <div className="globe-container">
      <button className={`weather-toggle ${showWeather ? 'active' : ''}`} onClick={toggleWeather}>
        <span className="toggle-dot" />
        {showWeather ? 'Weather ON' : 'Weather OFF'}
      </button>
      <canvas ref={canvasRef} className="globe-canvas" onClick={handleClick} style={{ cursor: 'crosshair' }} />
    </div>
  );
}
