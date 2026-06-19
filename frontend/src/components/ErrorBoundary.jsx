import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isWebGL: false };
  }

  static getDerivedStateFromError(error) {
    const isWebGL = error && error.message && error.message.toLowerCase().includes('webgl');
    return { hasError: true, error, isWebGL };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
  }

  handleRetry = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, isWebGL: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default SpaceX styled fallback UI
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            padding: '24px',
            background: '#0d0d0d',
            border: '1px solid #00D4FF',
            borderRadius: '4px',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          <h3
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              color: '#FF4444',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
              marginBottom: '8px',
              marginTop: 0,
            }}
          >
            {this.state.isWebGL ? 'GRAPHICS CONTEXT LOST' : 'COMPONENT DEGRADED'}
          </h3>
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              color: '#888888',
              fontSize: '11px',
              marginBottom: '16px',
              lineHeight: 1.5,
              maxWidth: '300px',
            }}
          >
            {this.state.isWebGL 
              ? 'WebGL rendering engine context was lost or failed to initialize.' 
              : (this.state.error?.message || 'Operational module breakdown.')}
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #00D4FF',
              color: '#00D4FF',
              cursor: 'pointer',
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderRadius: '2px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(0,212,255,0.08)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            Re-init module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
