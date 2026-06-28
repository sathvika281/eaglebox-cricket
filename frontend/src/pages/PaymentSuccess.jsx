import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ref    = params.get('ref');
  const id     = params.get('id');
  const method = params.get('method');
  const total  = params.get('total');

  const isVenue = method === 'venue';

  return (
    <div style={s.page}>
      <TopBar showBack backPath="/my-bookings" />
      <div style={s.wrap}>
        <div style={s.glow} />

        <div style={{ ...s.iconWrap, ...(isVenue ? { borderColor: 'rgba(255,200,0,0.3)', backgroundColor: 'rgba(255,200,0,0.08)' } : {}) }}>
          <span className="material-symbols-outlined" style={{ ...s.icon, ...(isVenue ? { color: '#FFC800' } : {}) }}>
            {isVenue ? 'store' : 'check_circle'}
          </span>
        </div>

        <p style={{ ...s.tag, ...(isVenue ? { color: '#FFC800' } : {}) }}>
          {isVenue ? '🏏 SLOT RESERVED' : '⚡ PAYMENT SUCCESSFUL'}
        </p>
        <h1 style={s.title}>{isVenue ? 'BOOKING RESERVED!' : 'BOOKING CONFIRMED!'}</h1>
        <div style={{ ...s.divider, ...(isVenue ? { backgroundColor: '#FFC800' } : {}) }} />
        <p style={s.sub}>
          {isVenue
            ? 'Your slot is reserved. Please pay at the venue counter on match day to confirm your booking.'
            : 'Your arena slot is locked and payment is complete.'}
        </p>

        {ref && (
          <div style={{ ...s.refCard, ...(isVenue ? { borderColor: 'rgba(255,200,0,0.2)', backgroundColor: 'rgba(255,200,0,0.04)' } : {}) }}>
            <p style={s.refLabel}>BOOKING REF</p>
            <p style={{ ...s.refValue, ...(isVenue ? { color: '#FFC800' } : {}) }}>{ref}</p>
            {isVenue ? (
              <>
                <p style={{ ...s.refHint, color: '#FFC800', marginBottom: 6 }}>SHOW THIS REF AT THE VENUE COUNTER</p>
                {total && <p style={{ ...s.refHint, fontSize: '13px', color: '#aaa' }}>Amount due: ₹{total}</p>}
              </>
            ) : (
              <p style={s.refHint}>SHOW THIS AT THE VENUE COUNTER</p>
            )}
          </div>
        )}

        {isVenue && (
          <div style={s.venueInfoBox}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#FFC800', marginRight: '8px', flexShrink: 0 }}>info</span>
            <p style={s.venueInfoText}>
              Your slot is held for you. Pay at the venue on the day of your booking. The slot will be released if payment is not made.
            </p>
          </div>
        )}

        {!isVenue && id && (
          <button style={s.btnPass} onClick={() => navigate(`/booking-pass/${id}`)}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '8px' }}>qr_code_2</span>
            VIEW BOOKING PASS
          </button>
        )}
        <button style={s.btnPrimary} onClick={() => navigate('/my-bookings')}>
          VIEW MY BOOKINGS
          <span className="material-symbols-outlined" style={{ fontSize: '16px', marginLeft: '8px' }}>arrow_forward</span>
        </button>
        <button style={s.btnSecondary} onClick={() => navigate('/booking')}>
          BOOK ANOTHER SLOT
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
    padding: '40px 16px 100px', maxWidth: '480px', margin: '0 auto',
    position: 'relative', overflow: 'hidden', textAlign: 'center',
  },
  glow: {
    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
    width: '300px', height: '220px', borderRadius: '50%',
    backgroundColor: 'rgba(191,255,0,0.08)', filter: 'blur(60px)', pointerEvents: 'none',
  },
  iconWrap: {
    width: '80px', height: '80px', borderRadius: '50%',
    backgroundColor: 'rgba(191,255,0,0.1)', border: '1px solid rgba(191,255,0,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
  },
  icon: { fontSize: '40px', color: '#BFFF00' },
  tag: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    letterSpacing: '0.2em', color: '#BFFF00', marginBottom: '8px',
  },
  title: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(22px,6vw,30px)',
    fontWeight: 700, color: '#fff', letterSpacing: '0.04em', marginBottom: '10px',
  },
  divider: { width: '48px', height: '2px', backgroundColor: '#BFFF00', marginBottom: '14px', borderRadius: '2px' },
  sub: { fontSize: '14px', color: '#666', marginBottom: '28px', lineHeight: 1.5 },
  refCard: {
    width: '100%', backgroundColor: 'rgba(191,255,0,0.05)', border: '1px solid rgba(191,255,0,0.2)',
    borderRadius: '12px', padding: '20px', marginBottom: '24px',
  },
  refLabel: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.2em', color: '#555', marginBottom: '8px',
  },
  refValue: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '24px',
    fontWeight: 700, color: '#BFFF00', marginBottom: '8px',
  },
  refHint: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.12em', color: '#444',
  },
  btnPrimary: {
    width: '100%', backgroundColor: '#BFFF00', color: '#000',
    border: 'none', borderRadius: '10px', padding: '16px',
    fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em',
    fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '10px',
  },
  btnPass: {
    width: '100%', backgroundColor: 'transparent', color: '#BFFF00',
    border: '2px solid #BFFF00', borderRadius: '10px', padding: '15px',
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
  venueInfoBox: {
    width: '100%', display: 'flex', alignItems: 'flex-start',
    backgroundColor: 'rgba(255,200,0,0.06)', border: '1px solid rgba(255,200,0,0.2)',
    borderRadius: '10px', padding: '14px 16px', marginBottom: '20px',
  },
  venueInfoText: {
    fontSize: '13px', color: '#aaa', lineHeight: 1.5, margin: 0,
  },
};
