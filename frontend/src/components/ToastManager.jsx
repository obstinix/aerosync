import { useState, useEffect, useRef, useCallback } from 'react';
import useStore from '../store/useStore';

const SEVERITY_COLORS = {
  critical: '#FF4444',
  warning: '#FFB020',
  info: '#00D4FF',
};

const SEVERITY_ICONS = {
  critical: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 1L15 14H1L8 1Z" stroke="#FF4444" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 6V9" stroke="#FF4444" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.75" fill="#FF4444" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.5" stroke="#FFB020" strokeWidth="1.5" />
      <path d="M8 5V9" stroke="#FFB020" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.75" fill="#FFB020" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.5" stroke="#00D4FF" strokeWidth="1.5" />
      <path d="M8 7V12" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="4.75" r="0.75" fill="#00D4FF" />
    </svg>
  ),
};

const AUTO_DISMISS_MS = 5000;
const MAX_VISIBLE = 3;
const ANIMATION_MS = 300;

/* ─── Single Toast ─── */
function Toast({ notification, onDismiss }) {
  const { id, severity, title, message, onClick } = notification;
  const color = SEVERITY_COLORS[severity] || SEVERITY_COLORS.info;
  const icon = SEVERITY_ICONS[severity] || SEVERITY_ICONS.info;

  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  const timerRef = useRef(null);
  const startRef = useRef(null);
  const remainingRef = useRef(AUTO_DISMISS_MS);
  const rafRef = useRef(null);

  const dismiss = useCallback(() => {
    setExiting(true);
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
    setTimeout(() => onDismiss(id), ANIMATION_MS);
  }, [id, onDismiss]);

  // Animate progress bar
  const tickProgress = useCallback(() => {
    if (!startRef.current) return;
    const elapsed = Date.now() - startRef.current;
    const pct = Math.max(0, ((remainingRef.current - elapsed) / AUTO_DISMISS_MS) * 100);
    setProgress(pct);
    if (pct > 0) {
      rafRef.current = requestAnimationFrame(tickProgress);
    }
  }, []);

  const startTimer = useCallback(() => {
    startRef.current = Date.now();
    timerRef.current = setTimeout(dismiss, remainingRef.current);
    rafRef.current = requestAnimationFrame(tickProgress);
  }, [dismiss, tickProgress]);

  const pauseTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    if (startRef.current) {
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startRef.current));
    }
    startRef.current = null;
  }, []);

  // Mount: slide in + start auto-dismiss
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    startTimer();
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hover: pause / resume
  useEffect(() => {
    if (hovered) {
      pauseTimer();
    } else if (visible && !exiting) {
      startTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered]);

  const handleBodyClick = () => {
    if (onClick) onClick(notification);
  };

  return (
    <div
      role="alert"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 340,
        background: '#0D0D0D',
        borderRadius: 6,
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        opacity: visible && !exiting ? 1 : 0,
        transform: visible && !exiting ? 'translateX(0)' : 'translateX(60px)',
        transition: `opacity ${ANIMATION_MS}ms ease, transform ${ANIMATION_MS}ms ease`,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
      onClick={handleBodyClick}
    >
      {/* Content */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 36px 12px 12px',
      }}>
        {/* Icon */}
        <div style={{
          flexShrink: 0,
          marginTop: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          borderRadius: 4,
          background: `${color}12`,
        }}>
          {icon}
        </div>

        {/* Text */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: '#E8E8E8',
            lineHeight: '18px',
            marginBottom: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {title}
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: '#888888',
            lineHeight: '16px',
            wordBreak: 'break-word',
          }}>
            {message}
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
        aria-label="Close notification"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 22,
          height: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          color: '#555555',
          cursor: 'pointer',
          borderRadius: 4,
          padding: 0,
          transition: 'color 150ms ease, background 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#AAAAAA';
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#555555';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'rgba(255,255,255,0.04)',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: color,
          opacity: 0.5,
          transition: hovered ? 'none' : 'width 50ms linear',
        }} />
      </div>
    </div>
  );
}

/* ─── Toast Manager ─── */
export default function ToastManager() {
  const notifications = useStore((s) => s.notifications);
  const removeNotification = useStore((s) => s.removeNotification);

  const visibleToasts = notifications.slice(0, MAX_VISIBLE);

  if (visibleToasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        top: 60,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {visibleToasts.map((n) => (
        <Toast
          key={n.id}
          notification={n}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
}
