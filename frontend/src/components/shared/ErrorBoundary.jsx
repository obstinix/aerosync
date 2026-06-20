import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: 'var(--space-8)',
          background: 'var(--c-bg-primary)',
          color: 'var(--c-cream)',
          fontFamily: 'var(--font-body)',
          textAlign: 'center',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--c-red)', marginBottom: 'var(--space-2)' }}>
            SYSTEM DEGRADED (CRITICAL EXCEPTION)
          </h2>
          <p style={{ color: 'var(--c-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-data)' }}>
            Unknown render breakdown.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              background: 'var(--c-sky)',
              color: 'var(--c-cream)',
              border: 'none',
              borderRadius: 'var(--r-md)',
              cursor: 'pointer',
              fontFamily: 'var(--font-data)',
              fontSize: 'var(--text-xs)',
              letterSpacing: '0.05em',
            }}
          >
            RE-INIT SYSTEM LINK
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
