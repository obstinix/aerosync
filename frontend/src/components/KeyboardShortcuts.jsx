import { useState, useEffect, useCallback, useRef } from 'react';

/* ─── Shortcut data ─── */
const SHORTCUTS = [
  { keys: ['⌘', 'K'], separator: '+', description: 'Command Palette' },
  { keys: ['?'], description: 'This Menu' },
  { keys: ['Esc'], description: 'Close Any Panel' },
  { keys: ['Click', 'Drag'], separator: '+', description: 'Rotate Globe' },
  { keys: ['Scroll'], description: 'Zoom Globe' },
  { keys: ['T', 'O', 'W', 'E', 'R'], description: 'Control Tower View' },
  { keys: ['3×', 'Logo Click'], description: 'Control Tower View' },
];

/* ─── Styles ─── */
const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(2px)',
    animation: 'kb-overlay-in 150ms ease-out both',
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0A0A0A',
    border: '1px solid rgba(0, 212, 255, 0.15)',
    borderRadius: 8,
    padding: '24px 28px',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), 0 0 1px rgba(0, 212, 255, 0.2)',
    animation: 'kb-modal-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  title: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#F5F5F5',
    margin: 0,
  },
  closeHint: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    color: '#555',
    letterSpacing: '0.05em',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
  },
  description: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: 12,
    color: '#888888',
    flexShrink: 0,
  },
  keysGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    marginLeft: 16,
  },
  keyChip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11,
    lineHeight: 1,
    color: '#00D4FF',
    backgroundColor: '#1A1A1A',
    border: '1px solid #00D4FF',
    borderRadius: 4,
    padding: '3px 8px',
    boxShadow:
      '0 2px 0 rgba(0, 212, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  separator: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    color: '#555555',
    padding: '0 1px',
    userSelect: 'none',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    margin: '2px 0',
    border: 'none',
  },
};

/* ─── Inline keyframes (injected once) ─── */
const KEYFRAMES_ID = 'kb-shortcuts-keyframes';
function injectKeyframes() {
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes kb-overlay-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes kb-modal-in {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

/* ─── Key chip component ─── */
function KeyChip({ label }) {
  return <span style={styles.keyChip}>{label}</span>;
}

/* ─── Shortcut row ─── */
function ShortcutRow({ shortcut }) {
  const { keys, separator, description } = shortcut;
  return (
    <div style={styles.row}>
      <span style={styles.description}>{description}</span>
      <span style={styles.keysGroup}>
        {keys.map((key, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {i > 0 && separator && (
              <span style={styles.separator}>{separator}</span>
            )}
            <KeyChip label={key} />
          </span>
        ))}
      </span>
    </div>
  );
}

/* ─── Modal component ─── */
export function KeyboardShortcuts({ isOpen, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    injectKeyframes();
  }, []);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [isOpen, onClose]);

  /* Close on click-outside */
  const handleOverlayClick = useCallback(
    (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onMouseDown={handleOverlayClick}>
      <div ref={modalRef} style={styles.modal} role="dialog" aria-label="Keyboard shortcuts">
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Keyboard Shortcuts</h2>
          <span style={styles.closeHint}>ESC to close</span>
        </div>

        {/* Shortcut rows */}
        {SHORTCUTS.map((s, i) => (
          <div key={i}>
            <ShortcutRow shortcut={s} />
            {i < SHORTCUTS.length - 1 && <hr style={styles.divider} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Global hook ─── */
export function useKeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      /* Skip when user is typing in an input/textarea/contenteditable */
      const tag = e.target.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, open, close };
}
