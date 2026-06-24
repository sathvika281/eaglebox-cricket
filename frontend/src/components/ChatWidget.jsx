import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const SUGGESTIONS = [
  'How do I book a slot?',
  'How do I cancel my booking?',
  'Where is my QR pass?',
  'What are the slot prices?',
];

const parseMarkdown = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code style="background:#2a2a2a;padding:1px 5px;border-radius:3px;font-size:0.85em">$1</code>');

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: user
        ? `Hi ${user.name?.split(' ')[0] || 'there'}! I'm the EagleBox Cricket Assistant. How can I help you today?`
        : "Hi! I'm the EagleBox Cricket Assistant. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setShowSuggestions(false);

    const userMsg = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      const { data } = await api.post('/api/v1/chat', { message: msg, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't reach the server. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: '50%',
          background: open ? '#333' : '#BFFF00',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          transition: 'background 0.2s, transform 0.2s',
          transform: open ? 'rotate(45deg)' : 'none',
        }}
        aria-label={open ? 'Close chat' : 'Open chat assistant'}
      >
        {open
          ? <span style={{ fontSize: 24, color: '#fff', lineHeight: 1 }}>✕</span>
          : <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#000' }}>sports_cricket</span>
        }
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 9998,
          width: 'min(360px, calc(100vw - 32px))',
          height: 'min(520px, calc(100vh - 120px))',
          background: '#111', border: '1px solid #2a2a2a',
          borderRadius: 16, display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px', background: '#1a1a1a',
            borderBottom: '1px solid #2a2a2a',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#BFFF00', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18, flexShrink: 0,
            }}><span className="material-symbols-outlined" style={{ fontSize: 20, color: '#000' }}>sports_cricket</span></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>EagleBox Assistant</div>
              <div style={{ color: '#22CC66', fontSize: 11 }}>● Online</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 10,
            scrollbarWidth: 'thin', scrollbarColor: '#333 transparent',
          }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  background: m.role === 'user' ? '#BFFF00' : '#1e1e1e',
                  color: m.role === 'user' ? '#000' : '#e0e0e0',
                  padding: '9px 13px', borderRadius: 12,
                  borderBottomRightRadius: m.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: m.role === 'user' ? 12 : 4,
                  fontSize: 13, lineHeight: 1.55,
                  border: m.role === 'assistant' ? '1px solid #2a2a2a' : 'none',
                }}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(m.content) }}
                />
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: '#1e1e1e', border: '1px solid #2a2a2a',
                  padding: '10px 14px', borderRadius: 12, borderBottomLeftRadius: 4,
                  display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0, 1, 2].map((d) => (
                    <span key={d} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#666',
                      animation: 'chatPulse 1.2s infinite',
                      animationDelay: `${d * 0.2}s`,
                      display: 'inline-block',
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && messages.length === 1 && (
              <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      background: 'transparent', border: '1px solid #333',
                      color: '#aaa', borderRadius: 20, padding: '5px 10px',
                      fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.target.style.borderColor = '#BFFF00'; e.target.style.color = '#BFFF00'; }}
                    onMouseLeave={(e) => { e.target.style.borderColor = '#333'; e.target.style.color = '#aaa'; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid #2a2a2a',
            display: 'flex', gap: 8, alignItems: 'flex-end',
            background: '#111',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder="Ask me anything..."
              disabled={loading}
              style={{
                flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: 10, padding: '9px 12px',
                color: '#fff', fontSize: 13, resize: 'none',
                fontFamily: 'inherit', lineHeight: 1.4,
                outline: 'none', maxHeight: 80, overflowY: 'auto',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#BFFF00'; }}
              onBlur={(e) => { e.target.style.borderColor = '#2a2a2a'; }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: input.trim() && !loading ? '#BFFF00' : '#222',
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 0.2s',
              }}
              aria-label="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke={input.trim() && !loading ? '#000' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() && !loading ? '#000' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes chatPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
