import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

// ── Page entries ────────────────────────────────────────────
const PAGES = [
  { label: 'Operations',  route: '/operations',  icon: '📍' },
  { label: 'Scheduling',  route: '/scheduling',  icon: '📍' },
  { label: 'Cargo',       route: '/cargo',       icon: '📍' },
  { label: 'Disruptions', route: '/simulator',   icon: '📍' },
  { label: 'Analytics',   route: '/analytics',   icon: '📍' },
  { label: 'War Room',    route: '/warroom',      icon: '📍' },
];

// ── Fuzzy (substring) match — returns indices of matched chars ──
function fuzzyMatch(query, text) {
  if (!query) return { match: true, indices: [] };
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return { match: false, indices: [] };
  const indices = [];
  for (let i = idx; i < idx + lowerQuery.length; i++) indices.push(i);
  return { match: true, indices };
}

// ── Highlight matched chars in cyan ─────────────────────────
function HighlightedText({ text, indices }) {
  if (!indices.length) return <span>{text}</span>;
  const indexSet = new Set(indices);
  return (
    <span>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          style={indexSet.has(i) ? { color: '#00D4FF', fontWeight: 600 } : undefined}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

// ── Styles ──────────────────────────────────────────────────
const S = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '18vh',
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    animation: 'cmdFadeIn 100ms ease-out',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    maxHeight: 420,
    display: 'flex',
    flexDirection: 'column',
    background: '#0A0A0A',
    border: '1px solid rgba(0,212,255,0.20)',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(0,0,0,0.85), 0 0 1px rgba(0,212,255,0.3)',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 14px',
    borderBottom: '1px solid rgba(0,212,255,0.12)',
  },
  inputIcon: {
    color: '#00D4FF',
    fontSize: 14,
    opacity: 0.6,
    marginRight: 10,
    fontFamily: '"JetBrains Mono", monospace',
    userSelect: 'none',
  },
  input: {
    flex: 1,
    height: 48,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 14,
    color: '#F5F5F5',
    letterSpacing: '0.02em',
    caretColor: '#00D4FF',
  },
  shortcut: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    color: 'rgba(245,245,245,0.3)',
    border: '1px solid rgba(245,245,245,0.12)',
    borderRadius: 4,
    padding: '2px 6px',
    letterSpacing: '0.04em',
    userSelect: 'none',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '6px 0',
  },
  sectionLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    color: 'rgba(245,245,245,0.35)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '10px 14px 4px',
    userSelect: 'none',
  },
  item: (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12,
    color: '#F5F5F5',
    cursor: 'pointer',
    borderLeft: isSelected ? '2px solid #00D4FF' : '2px solid transparent',
    background: isSelected ? 'rgba(0,212,255,0.08)' : 'transparent',
    transition: 'background 60ms, border-color 60ms',
  }),
  itemIcon: {
    fontSize: 14,
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
  },
  itemMeta: {
    marginLeft: 'auto',
    fontSize: 10,
    color: 'rgba(245,245,245,0.3)',
    letterSpacing: '0.04em',
    flexShrink: 0,
  },
  empty: {
    padding: '32px 14px',
    textAlign: 'center',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12,
    color: 'rgba(245,245,245,0.3)',
    letterSpacing: '0.04em',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '8px 14px',
    borderTop: '1px solid rgba(0,212,255,0.08)',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    color: 'rgba(245,245,245,0.25)',
    letterSpacing: '0.04em',
    userSelect: 'none',
  },
  footerKey: {
    border: '1px solid rgba(245,245,245,0.12)',
    borderRadius: 3,
    padding: '1px 5px',
    marginRight: 4,
    fontSize: 10,
  },
};

// Inject keyframe once
if (typeof document !== 'undefined' && !document.getElementById('cmd-palette-keyframes')) {
  const style = document.createElement('style');
  style.id = 'cmd-palette-keyframes';
  style.textContent = `
    @keyframes cmdFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .cmd-palette-list::-webkit-scrollbar { width: 4px; }
    .cmd-palette-list::-webkit-scrollbar-track { background: transparent; }
    .cmd-palette-list::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.15); border-radius: 2px; }
    .cmd-palette-list::-webkit-scrollbar-thumb:hover { background: rgba(0,212,255,0.3); }
  `;
  document.head.appendChild(style);
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const cardRef = useRef(null);

  const flights = useStore((s) => s.flights);
  const setSelectedFlight = useStore((s) => s.setSelectedFlight);
  const navigate = useNavigate();

  // ── Build searchable results ──────────────────────────────
  const results = useMemo(() => {
    const items = [];
    const q = query.trim();

    // Search pages
    const pageResults = [];
    for (const page of PAGES) {
      const m = fuzzyMatch(q, page.label);
      if (m.match) {
        pageResults.push({
          type: 'page',
          id: `page-${page.route}`,
          label: page.label,
          icon: page.icon,
          route: page.route,
          matchIndices: m.indices,
          meta: page.route,
        });
      }
    }

    // Search flights
    const flightResults = [];
    for (const flight of flights) {
      // Check multiple fields — take the first match for display highlighting
      const searchFields = [
        { key: 'id',          value: flight.id },
        { key: 'callsign',    value: flight.flightNumber },
        { key: 'origin',      value: flight.origin },
        { key: 'destination', value: flight.destination },
      ];

      let bestMatch = null;
      let displayLabel = `${flight.flightNumber}  ${flight.origin} → ${flight.destination}`;

      for (const field of searchFields) {
        const m = fuzzyMatch(q, field.value);
        if (m.match) {
          bestMatch = { field: field.key, indices: m.indices };
          break;
        }
      }

      if (bestMatch) {
        // Compute highlight indices relative to the full display label
        let labelIndices = [];
        if (q) {
          const displayMatch = fuzzyMatch(q, displayLabel);
          if (displayMatch.match) {
            labelIndices = displayMatch.indices;
          } else {
            // Fallback: highlight in the matched field portion
            labelIndices = [];
          }
        }

        flightResults.push({
          type: 'flight',
          id: flight.id,
          label: displayLabel,
          icon: '✈',
          flight,
          matchIndices: labelIndices,
          meta: flight.status,
        });
      }
    }

    // Limit flight results for performance
    const cappedFlights = flightResults.slice(0, 12);

    if (pageResults.length) {
      items.push({ type: 'section', label: 'Pages' });
      items.push(...pageResults);
    }
    if (cappedFlights.length) {
      items.push({ type: 'section', label: 'Flights' });
      items.push(...cappedFlights);
    }

    return items;
  }, [query, flights]);

  // Selectable (non-section) items
  const selectableItems = useMemo(
    () => results.filter((r) => r.type !== 'section'),
    [results],
  );

  // Reset selection when results change
  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // ── Keyboard shortcut to open ─────────────────────────────
  useEffect(() => {
    function handleGlobalKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery('');
            setSelectedIdx(0);
          }
          return !prev;
        });
      }
    }
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // ── Focus input on open ───────────────────────────────────
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // ── Close helpers ─────────────────────────────────────────
  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setSelectedIdx(0);
  }, []);

  // ── Select handler ────────────────────────────────────────
  const handleSelect = useCallback(
    (item) => {
      if (!item || item.type === 'section') return;
      if (item.type === 'page') {
        navigate(item.route);
      } else if (item.type === 'flight') {
        setSelectedFlight(item.flight);
        navigate('/operations');
      }
      close();
    },
    [navigate, setSelectedFlight, close],
  );

  // ── Keyboard navigation inside palette ────────────────────
  const handleInputKey = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, selectableItems.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(selectableItems[selectedIdx]);
        return;
      }
    },
    [selectableItems, selectedIdx, handleSelect, close],
  );

  // ── Scroll selected into view ─────────────────────────────
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-cmd-idx="${selectedIdx}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  // ── Click outside to close ────────────────────────────────
  const handleOverlayClick = useCallback(
    (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        close();
      }
    },
    [close],
  );

  // ── Status color chip ─────────────────────────────────────
  function statusColor(status) {
    if (status === 'delayed') return '#FFB020';
    if (status === 'critical') return '#FF4444';
    if (status === 'in-flight' || status === 'boarding') return '#00D4FF';
    return 'rgba(245,245,245,0.4)';
  }

  if (!open) return null;

  // ── Render ────────────────────────────────────────────────
  let selectableIdx = -1;

  return (
    <div style={S.overlay} onClick={handleOverlayClick}>
      <div ref={cardRef} style={S.card}>
        {/* ── Search input ─────────────────────────────────── */}
        <div style={S.inputWrap}>
          <span style={S.inputIcon}>{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKey}
            placeholder="Search flights, pages..."
            style={S.input}
            spellCheck={false}
            autoComplete="off"
          />
          <span style={S.shortcut}>ESC</span>
        </div>

        {/* ── Results list ─────────────────────────────────── */}
        <div ref={listRef} className="cmd-palette-list" style={S.list}>
          {results.length === 0 && query && (
            <div style={S.empty}>NO RESULTS FOR "{query.toUpperCase()}"</div>
          )}

          {results.length === 0 && !query && (
            <div style={S.empty}>TYPE TO SEARCH FLIGHTS &amp; PAGES</div>
          )}

          {results.map((item, i) => {
            if (item.type === 'section') {
              return (
                <div key={item.label} style={S.sectionLabel}>
                  {item.label}
                </div>
              );
            }

            selectableIdx++;
            const thisIdx = selectableIdx;
            const isSelected = thisIdx === selectedIdx;

            return (
              <div
                key={item.id}
                data-cmd-idx={thisIdx}
                style={S.item(isSelected)}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIdx(thisIdx)}
              >
                <span style={S.itemIcon}>{item.icon}</span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <HighlightedText text={item.label} indices={item.matchIndices} />
                </span>
                {item.type === 'flight' && (
                  <span
                    style={{
                      ...S.itemMeta,
                      color: statusColor(item.meta),
                    }}
                  >
                    {item.meta?.toUpperCase()}
                  </span>
                )}
                {item.type === 'page' && (
                  <span style={S.itemMeta}>{item.meta}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer hints ─────────────────────────────────── */}
        <div style={S.footer}>
          <span><span style={S.footerKey}>↑↓</span> navigate</span>
          <span><span style={S.footerKey}>↵</span> select</span>
          <span><span style={S.footerKey}>esc</span> close</span>
        </div>
      </div>
    </div>
  );
}
