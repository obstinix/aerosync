import { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { Radio, Volume2, Play, Pause, ChevronDown, Music } from 'lucide-react';

const ATC_FEEDS = {
  DEL: 'https://www.liveatc.net/play/vidp.pls',
  BOM: 'https://www.liveatc.net/play/vabb.pls',
  BLR: null,
  MAA: null,
};

const AMBIENT_URL = 'https://freesound.org/data/previews/417/417480_5121236-lq.mp3';

export default function ATCAudioWidget() {
  const selectedHub = useStore((s) => s.selectedHub);
  
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  
  // feedMode can be: 'checking' | 'active' | 'ambient' | 'error'
  const [feedMode, setFeedMode] = useState('checking');
  const [activeUrl, setActiveUrl] = useState(AMBIENT_URL);

  const audioRef = useRef(null);

  const currentHub = selectedHub === 'ALL' ? 'DEL' : selectedHub;
  const rawFeedUrl = ATC_FEEDS[currentHub] || null;

  // Check the feed availability on hub change
  useEffect(() => {
    let active = true;
    const checkFeed = async () => {
      if (!rawFeedUrl) {
        if (active) {
          setFeedMode('ambient');
          setActiveUrl(AMBIENT_URL);
        }
        return;
      }

      setFeedMode('checking');
      setLoading(true);

      try {
        // Try fetching HEAD with a 3-second timeout
        const res = await fetch(rawFeedUrl, { 
          method: 'HEAD', 
          mode: 'no-cors', // Avoid CORS errors from blocking HEAD checks
          signal: AbortSignal.timeout(3000) 
        });
        
        if (active) {
          setFeedMode('active');
          setActiveUrl(rawFeedUrl);
        }
      } catch (err) {
        console.warn(`[ATC] Feed connection failed for ${currentHub}:`, err);
        if (active) {
          setFeedMode('ambient');
          setActiveUrl(AMBIENT_URL);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    // If currently playing, pause before checking/switching
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    checkFeed();

    return () => {
      active = false;
    };
  }, [currentHub, rawFeedUrl]);

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('[ATC] Playback error:', err);
          setFeedMode('error');
          setIsPlaying(false);
        });
    }
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  // Get indicator dot color based on state
  const getDotColor = () => {
    if (!isPlaying) return '#555555';
    if (feedMode === 'active') return '#00D4FF';   // Active: Cyan
    if (feedMode === 'ambient') return '#D400FF';  // Ambient: Purple
    if (feedMode === 'error') return '#FFB020';    // Error: Amber
    return '#555555';
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        background: '#0d0d0d',
        border: '1px solid rgba(0, 212, 255, 0.25)',
        width: expanded ? '300px' : '48px',
        height: expanded ? 'auto' : '48px',
        borderRadius: expanded ? '6px' : '24px', // pill shape when collapsed
        display: 'flex',
        flexDirection: 'column',
        alignItems: expanded ? 'stretch' : 'center',
        justifyContent: expanded ? 'flex-start' : 'center',
        padding: expanded ? '14px' : '0px',
        color: '#F5F5F5',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: expanded ? 'default' : 'pointer',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
      onClick={!expanded ? () => setExpanded(true) : undefined}
    >
      <audio
        ref={audioRef}
        src={activeUrl}
        preload="none"
        onEnded={() => setIsPlaying(false)}
      />

      {/* Collapsed Mode */}
      {!expanded && (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Radio size={18} color={isPlaying ? getDotColor() : '#888888'} />
          {/* Status Indicator Dot */}
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: getDotColor(),
              boxShadow: isPlaying ? `0 0 8px ${getDotColor()}` : 'none',
              animation: isPlaying ? 'aero-pulse 1.5s infinite ease-in-out' : 'none',
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
              <Radio size={16} color={isPlaying ? getDotColor() : '#888888'} />
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
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#F5F5F5'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#888888'}
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Hub Info & Source Status */}
          <div
            style={{
              background: '#050505',
              padding: '10px 12px',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#666666' }}>
                CURRENT HUB
              </span>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: '#00D4FF', fontWeight: 600 }}>
                {currentHub}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#666666' }}>
                SOURCE STATUS
              </span>
              <span style={{ 
                fontFamily: 'var(--font-data)', 
                fontSize: '10px', 
                color: getDotColor(), 
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                {feedMode === 'checking' ? 'Testing feed...' : feedMode === 'active' ? 'Live stream active' : 'Ambient fallback'}
              </span>
            </div>
          </div>

          {/* Audio Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={togglePlay}
              disabled={feedMode === 'checking'}
              style={{
                background: isPlaying ? 'rgba(255,68,68,0.1)' : 'rgba(0,212,255,0.1)',
                border: `1px solid ${isPlaying ? '#FF4444' : '#00D4FF'}`,
                color: isPlaying ? '#FF4444' : '#00D4FF',
                borderRadius: '4px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: feedMode === 'checking' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={16} color="#888888" />
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
                  height: '3px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>

          {/* Status Alert Text */}
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '9px',
              textAlign: 'center',
              color: feedMode === 'ambient' ? '#D400FF' : feedMode === 'error' ? '#FFB020' : '#888888',
              lineHeight: '1.3',
            }}
          >
            {feedMode === 'ambient' 
              ? `Live ATC unavailable for ${currentHub} — playing ambient radio`
              : feedMode === 'error'
              ? 'Error streaming ATC audio'
              : 'ATC channel tuned to Indian Airspace'}
          </div>
        </div>
      )}
    </div>
  );
}
