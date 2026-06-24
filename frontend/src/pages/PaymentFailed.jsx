import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

export default function PaymentFailed() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ref = params.get('ref');

  return (
    <div style={s.page}>
      <TopBar showBack backPath="/my-bookings" />
      <div style={s.wrap}>
        <div style={s.iconWrap}>
          <span className="material-symbols-outlined" style={s.icon}>cancel</span>
        </div>

        <p style={s.tag}>✕ PAYMENT INCOMPLETE</p>
        <h1 style={s.title}>NOT PAID YET</h1>
        <div style={s.divider} />
        <p style={s.sub}>
          Your slot is reserved but payment wasn't completed.
          You can retry or pay at the venue counter.
        </p>

        {ref && (
          <div style={s.refCard}>
            <p style={s.refLabel}>BOOKING REF (PENDING PAYMENT)</p>
            <p style={s.refValue}>{ref}</p>
          </div>
        )}

        <button style={s.btnPrimary} onClick={() => navigate('/booking')}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '8px' }}>refresh</span>
          TRY AGAIN
        </button>
        <button style={s.btnSecondary} onClick={() => navigate('/my-bookings')}>
          VIEW MY BOOKINGS
        </button>
      </div>
      <BottomNav />
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#fff', fontFamily: "'Hanken Grotesk', sans-serif" },
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '40px 16px 100px', maxWidth: '480px', margin: '0 auto', textAlign: 'center',
  },
  iconWrap: {
    width: '80px', height: '80px', borderRadius: '50%',
    backgroundColor: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
  },
  icon: { fontSize: '40px', color: '#FF4444' },
  tag: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    letterSpacing: '0.2em', color: '#FF4444', marginBottom: '8px',
  },
  title: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(22px,6vw,30px)',
    fontWeight: 700, color: '#fff', letterSpacing: '0.04em', marginBottom: '10px',
  },
  divider: { width: '48px', height: '2px', backgroundColor: '#FF4444', marginBottom: '14px', borderRadius: '2px', opacity: 0.5 },
  sub: { fontSize: '14px', color: '#666', marginBottom: '28px', lineHeight: 1.5 },
  refCard: {
    width: '100%', backgroundColor: '#161616', border: '1px solid #222',
    borderRadius: '12px', padding: '20px', marginBottom: '24px',
  },
  refLabel: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.2em', color: '#555', marginBottom: '8px',
  },
  refValue: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '22px',
    fontWeight: 700, color: '#888',
  },
  btnPrimary: {
    width: '100%', backgroundColor: '#BFFF00', color: '#000',
    border: 'none', borderRadius: '10px', padding: '16px',
    fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em',
    fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '10px',
  },
  btnSecondary: {
    width: '100%', backgroundColor: 'transparent', color: '#fff',
    border: '1px solid #333', borderRadius: '10px', padding: '14px',
    fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em',
    fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
  },
};
