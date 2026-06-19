import { useState, useRef, useEffect } from 'react';
import useFlightData from '../hooks/useFlightData.js';
import Globe3D from '../components/Globe3D.jsx';
import { AIRPORTS } from '../store/mockData.js';
import { Send, Bot, User, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:9002';

export default function WarRoom() {
  const { flights } = useFlightData();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '### AeroSync AI War Room Initialized\n\nI have loaded live flight status and weather context. Send a command to generate a network recovery plan, identify delay cascades, or request cargo mitigation solutions.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${AI_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages.slice(1).map(m => ({ role: m.role, content: m.content })),
          flights: flights || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat error: ${response.statusText}`);
      }

      // Add a placeholder for streaming response
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value);
        const lines = textChunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.text) {
                assistantText += data.text;
                // Update assistant message in-place
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: assistantText,
                  };
                  return updated;
                });
              }
            } catch (err) {
              console.error('Failed to parse SSE JSON line:', line, err);
            }
          }
        }
      }
    } catch (error) {
      console.error('[AI War Room] Chat request failed:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ **System Connection Error**: Failed to stream response from AI Service. Ensure the AI Service is running at `' + AI_URL + '`.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      height: '100%',
      background: 'var(--c-bg-primary)',
      overflow: 'hidden',
    }}>
      {/* Left Pane: Interactive Flight Map */}
      <div style={{
        position: 'relative',
        height: '100%',
        borderRight: '1px solid var(--c-border)',
      }}>
        <Globe3D flights={flights} airports={Object.values(AIRPORTS)} />
        <div style={{
          position: 'absolute',
          top: 'var(--space-4)',
          left: 'var(--space-4)',
          background: 'rgba(0,0,0,0.85)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--r-md)',
          padding: 'var(--space-3) var(--space-4)',
          zIndex: 1000,
          pointerEvents: 'none',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'aero-pulse 1.5s infinite' }}></div>
            <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              WAR ROOM COORDINATION MAP
            </span>
          </div>
        </div>
      </div>

      {/* Right Pane: AI War Room Console */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--c-bg-secondary)',
        minWidth: 0,
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--c-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Sparkles size={16} color="var(--accent)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
              AI WAR ROOM CONSOLE
            </h3>
          </div>
          <span style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            padding: '2px 6px',
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent)',
            borderRadius: 'var(--r-sm)',
            color: 'var(--accent)',
            textTransform: 'uppercase',
          }}>
            LIVE SSE STREAM
          </span>
        </div>

        {/* Messages list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'flex-start',
                padding: 'var(--space-3)',
                borderRadius: 'var(--r-md)',
                background: msg.role === 'assistant' ? 'rgba(255,255,255,0.02)' : 'rgba(0,212,255,0.03)',
                border: `1px solid ${msg.role === 'assistant' ? 'var(--c-border)' : 'rgba(0,212,255,0.1)'}`,
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 'var(--r-sm)',
                background: msg.role === 'assistant' ? 'rgba(255,255,255,0.05)' : 'var(--accent-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {msg.role === 'assistant' ? (
                  <Bot size={14} color="var(--text-primary)" />
                ) : (
                  <User size={14} color="var(--accent)" />
                )}
              </div>
              <div style={{
                flex: 1,
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.5,
                overflowWrap: 'break-word',
              }}>
                <ReactMarkdown
                  components={{
                    h3: ({ node, ...props }) => <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, margin: '0 0 var(--space-2) 0', color: 'var(--accent)' }} {...props} />,
                    h4: ({ node, ...props }) => <h5 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, margin: 'var(--space-3) 0 var(--space-2) 0' }} {...props} />,
                    p: ({ node, ...props }) => <p style={{ margin: '0 0 var(--space-2) 0' }} {...props} />,
                    ul: ({ node, ...props }) => <ul style={{ margin: '0 0 var(--space-2) 0', paddingLeft: 'var(--space-4)' }} {...props} />,
                    li: ({ node, ...props }) => <li style={{ margin: '0 0 4px 0' }} {...props} />,
                    code: ({ node, inline, ...props }) => (
                      <code
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          padding: inline ? '2px 4px' : 'var(--space-3)',
                          borderRadius: 'var(--r-sm)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          display: inline ? 'inline' : 'block',
                          whiteSpace: inline ? 'normal' : 'pre-wrap',
                          border: inline ? 'none' : '1px solid var(--c-border)',
                        }}
                        {...props}
                      />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{
              display: 'flex',
              gap: 'var(--space-2)',
              alignItems: 'center',
              paddingLeft: 'var(--space-12)',
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
            }}>
              <Terminal size={12} className="aero-pulse" style={{ animation: 'aero-pulse 1s infinite' }} />
              <span>AEROSYNC AI THINKING...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <form
          onSubmit={handleSend}
          style={{
            padding: 'var(--space-4)',
            borderTop: '1px solid var(--c-border)',
            display: 'flex',
            gap: 'var(--space-2)',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI War Room (e.g., 'mitigate delays')"
            disabled={loading}
            style={{
              flex: 1,
              background: 'var(--c-bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-md)',
              padding: '10px var(--space-3)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              outline: 'none',
              transition: 'border-color var(--dur-fast)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--c-border)'}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              background: 'var(--accent)',
              color: '#000000',
              border: 'none',
              borderRadius: 'var(--r-md)',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'opacity var(--dur-fast)',
              opacity: (loading || !input.trim()) ? 0.5 : 1,
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
