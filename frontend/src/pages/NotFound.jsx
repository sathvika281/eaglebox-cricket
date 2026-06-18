import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <div style={s.glow} />
      <div style={s.content}>
        <p style={s.code}>404</p>
        <h1 style={s.title}>OUT OF BOUNDS</h1>
        <p style={s.sub}>This page doesn't exist. You may have the wrong URL or the page has been moved.</p>
        <div style={s.btns}>
          <button style={s.primary} onClick={() => navigate('/')}>
            GO HOME
            <span className="material-symbols-outlined" style={{ fontSize: '16px', marginLeft: '8px' }}>home</span>
          </button>
          <button style={s.secondary} onClick={() => navigate(-1)}>
            GO BACK
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', backgroundColor: '#0D0D0D',
    backgroundImage: "url('/bg-11-apex-arena.png')",
    backgroundSize: 'cover', backgroundPosition: 'center center',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    fontFamily: "'Hanken Grotesk', sans-serif",
  },
  glow: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(13,13,13,0.72) 0%, rgba(13,13,13,0.88) 100%)',
    pointerEvents: 'none',
  },
  content: {
    textAlign: 'center', padding: '24px 16px', position: 'relative', zIndex: 1,
  },
  code: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '120px',
    fontWeight: 800, color: '#1a1a1a', lineHeight: 1,
    letterSpacing: '-0.04em', marginBottom: '0',
  },
  title: {
    fontSize: 'clamp(28px, 8vw, 52px)', fontWeight: 800, color: '#fff',
    letterSpacing: '-0.02em', marginBottom: '16px', textTransform: 'uppercase',
  },
  sub: {
    fontSize: '14px', color: '#555', maxWidth: '300px',
    margin: '0 auto 36px', lineHeight: 1.6,
  },
  btns: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  primary: {
    display: 'flex', alignItems: 'center',
    backgroundColor: '#BFFF00', color: '#000', border: 'none',
    borderRadius: '8px', padding: '14px 28px', fontSize: '13px',
    fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace",
  },
  secondary: {
    backgroundColor: 'transparent', color: '#fff',
    border: '1px solid #333', borderRadius: '8px',
    padding: '14px 24px', fontSize: '13px', fontWeight: 600,
    letterSpacing: '0.08em', cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace",
  },
};
