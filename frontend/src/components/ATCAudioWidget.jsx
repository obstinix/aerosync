import { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { useSocket } from '../providers/SocketProvider.jsx';
import { Radio, Volume2, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';

const IATA_TO_ICAO = {
  JFK: 'KJFK',
  EWR: 'KEWR',
  LHR: 'EGLL',
  CDG: 'LFPG',
  DXB: 'OMDB',
  SIN: 'WSSS',
  LAX: 'KLAX',
  CDG: 'LFPG',
  ORD: 'KORD',
  NRT: 'RJAA',
};

export default function ATCAudioWidget() {
  const { socket } = useSocket();
  const selectedHub = useStore((s) => s.selectedHub);
  
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [amberAlert, setAmberAlert] = useState(false);

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const currentHub = selectedHub === 'ALL' ? 'JFK' : selectedHub;
  const icao = IATA_TO_ICAO[currentHub] || 'KJFK';
  
  // Real LiveATC stream URL format or official icecast feed structure
  // Note: we append timestamp to prevent browser cache
  const streamUrl = `https://www.liveatc.net/hlisten.php?mount=${icao.toLowerCase()}&qtime=${Date.now()}`;

  // Reset alert states on hub change
  useEffect(() => {
    setAmberAlert(false);
  }, [currentHub]);

  // Subscribe to alert:new via WS
  useEffect(() => {
    if (!socket) return;

    const handleNewAlert = (alert) => {
      if (alert.message && alert.message.toUpperCase().includes(currentHub)) {
        setAmberAlert(true);
      }
    };

    socket.on('alert:new', handleNewAlert);
    return () => {
      socket.off('alert:new', handleNewAlert);
    };
  }, [socket, currentHub]);

  // Timeout fallback logic
  const startLoadTimeout = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setError(false);
    setLoading(true);

    timerRef.current = setTimeout(() => {
      if (audioRef.current && (audioRef.current.paused || audioRef.current.readyState < 3)) {
        // state < HAVE_FUTURE_DATA (3) means it is not ready to play
        setError(true);
        setLoading(false);
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.pause();
      }
    }, 5000);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setLoading(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      setError(false);
      startLoadTimeout();
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          // Playback started
        })
        .catch(() => {
          setError(true);
          setLoading(false);
          setIsPlaying(false);
        });
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '80px',
        right: '24px',
        zIndex: 1000,
        background: '#0d0d0d',
        border: '1px solid var(--c-border)',
        width: expanded ? '280px' : '48px',
        height: expanded ? 'auto' : '48px',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: expanded ? 'stretch' : 'center',
        justifyContent: expanded ? 'flex-start' : 'center',
        padding: expanded ? '12px' : '0px',
        color: '#F5F5F5',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: expanded ? 'default' : 'pointer',
      }}
      onClick={!expanded ? () => setExpanded(true) : undefined}
    >
      <audio
        ref={audioRef}
        src={streamUrl}
        preload="none"
        onCanPlay={() => {
          setLoading(false);
          setError(false);
          if (timerRef.current) clearTimeout(timerRef.current);
        }}
        onError={() => {
          setError(true);
          setLoading(false);
          setIsPlaying(false);
          if (timerRef.current) clearTimeout(timerRef.current);
        }}
      />

      {/* Collapsed Mode */}
      {!expanded && (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Radio size={20} color={isPlaying ? '#00D4FF' : '#888888'} />
          {/* Status Indicator Dot */}
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: amberAlert ? '#FFB800' : isPlaying ? '#00D4FF' : 'transparent',
              boxShadow: (isPlaying || amberAlert) ? `0 0 8px ${amberAlert ? '#FFB800' : '#00D4FF'}` : 'none',
              animation: (isPlaying || amberAlert) ? 'aero-pulse 1.5s infinite ease-in-out' : 'none',
            }}
          />
        </div>
      )}

      {/* Expanded Mode */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={16} color={isPlaying ? '#00D4FF' : '#888888'} />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                ATC Live Audio
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#888888',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Hub Info */}
          <div
            style={{
              background: '#050505',
              padding: '8px 12px',
              borderRadius: '2px',
              border: '1px solid rgba(255,255,255,0.03)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#888888' }}>
              CURRENT HUB
            </span>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: '#00D4FF', fontWeight: 600 }}>
              {icao} ({currentHub})
            </span>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={togglePlay}
              disabled={loading}
              style={{
                background: isPlaying ? 'rgba(255,68,68,0.1)' : 'rgba(0,212,255,0.1)',
                border: `1px solid ${isPlaying ? '#FF4444' : '#00D4FF'}`,
                color: isPlaying ? '#FF4444' : '#00D4FF',
                borderRadius: '2px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={14} color="#888888" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  flex: 1,
                  accentColor: '#00D4FF',
                  height: '2px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>

          {/* Status Text / Fallback */}
          <div
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '10px',
              textAlign: 'center',
              color: error ? '#FF4444' : loading ? '#FFB800' : isPlaying ? '#00D4FF' : '#555555',
            }}
          >
            {error
              ? 'ATC feed unavailable'
              : loading
              ? 'Connecting to feed...'
              : isPlaying
              ? 'PULSING STREAM ACTIVE'
              : 'ATC AUDIO OFF'}
          </div>
        </div>
      )}
    </div>
  );
}
