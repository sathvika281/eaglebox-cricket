import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSlots } from '../api/slots.api';
import { formatTime, formatDateShort } from '../utils/formatters';
import BottomNav from '../components/layout/BottomNav';

const FEATURES = [
  { icon: 'bolt',          title: 'INSTANT BOOKING',    desc: 'Reserve your slot in seconds. No calls, no waiting.' },
  { icon: 'schedule',      title: 'REAL-TIME SLOTS',    desc: 'Live availability — always up to date.' },
  { icon: 'verified',      title: 'CONFIRMED INSTANTLY', desc: 'Get your booking reference the moment you confirm.' },
  { icon: 'sports_cricket',title: 'PREMIUM TURF',       desc: 'Floodlit synthetic pitch. Match-grade experience.' },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [slots, setSlots]   = useState([]);
  const [slotDate]          = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    getSlots({ date: slotDate, status: 'available', limit: 6 })
      .then(({ data }) => setSlots(data.data || []))
      .catch(() => {});
  }, [slotDate]);

  return (
    <div style={s.page}>
      {/* Top bar */}
      <header style={s.topBar}>
        <div style={s.logoRow}>
          <div style={s.logoMark}>{'>'}</div>
          <span style={s.logoText}>EAGLE BOX CRICKET</span>
        </div>
        <div style={s.topRight}>
          <button style={s.iconBtn}>
            <span className="material-symbols-outlined" style={s.bellIcon}>notifications</span>
          </button>
          {isAuthenticated ? (
            <button style={s.authBtn} onClick={() => navigate('/dashboard')}>DASHBOARD</button>
          ) : (
            <button style={s.authBtn} onClick={() => navigate('/login')}>SIGN IN</button>
          )}
        </div>
      </header>

      {/* Trending ticker */}
      <div style={s.ticker}>
        <span style={s.tickerDot} />
        <span style={s.tickerLabel}>TRENDING:</span>
        <span style={s.tickerText}>Book your arena slot for tonight · Premium turf available · 6-on-6 matches</span>
      </div>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroOverlay} />
        <div style={s.heroGlow} />
        <p style={s.heroTag}>HYDERABAD · BOX CRICKET · ARENA</p>
        <h1 style={s.heroTitle}>
          BOOK.<br />
          <span style={s.heroAccent}>PLAY.</span><br />
          COMPETE.
        </h1>
        <p style={s.heroSub}>
          Eagle Box Cricket — premium synthetic turf, high-intensity floodlights,
          and the ultimate arena for your next match.
        </p>
        <div style={s.heroBtns}>
          <button style={s.primaryBtn} onClick={() => navigate(isAuthenticated ? '/booking' : '/login')}>
            BOOK SLOT
            <span className="material-symbols-outlined" style={s.btnIcon}>arrow_forward</span>
          </button>
          <button style={s.secondaryBtn} onClick={() => navigate(isAuthenticated ? '/my-bookings' : '/register')}>
            {isAuthenticated ? 'MY BOOKINGS' : 'CREATE ACCOUNT'}
          </button>
        </div>
      </section>

      {/* Available slots today */}
      <section style={s.section}>
        <div style={s.sectionHead}>
          <div>
            <p style={s.sectionTag}>LIVE AVAILABILITY</p>
            <h2 style={s.sectionTitle}>AVAILABLE SLOTS TODAY</h2>
          </div>
          <button style={s.viewAllBtn} onClick={() => navigate(isAuthenticated ? '/booking' : '/login')}>
            VIEW ALL
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          </button>
        </div>

        {slots.length === 0 ? (
          <div style={s.emptySlots}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#333', display: 'block', marginBottom: '8px' }}>event_busy</span>
            <p style={s.emptyText}>No available slots today. Check tomorrow.</p>
          </div>
        ) : (
          <div style={s.slotGrid}>
            {slots.map((slot) => (
              <button
                key={slot.id}
                style={s.slotCard}
                onClick={() => navigate(isAuthenticated ? '/booking' : '/login')}
              >
                <span style={s.slotSession}>
                  {parseInt(slot.start_time) < 12 ? 'MORNING' : 'PRIME TIME'}
                </span>
                <span style={s.slotTime}>
                  {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                </span>
                <span style={s.slotPrice}>₹{slot.price}</span>
                <div style={s.availableDot} />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section style={{ ...s.section, backgroundColor: '#111113' }}>
        <p style={s.sectionTag}>WHY EAGLE BOX CRICKET</p>
        <h2 style={s.sectionTitle}>BUILT FOR THE ARENA</h2>
        <div style={s.featureGrid}>
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} style={s.featureCard}>
              <span className="material-symbols-outlined" style={s.featureIcon}>{icon}</span>
              <h3 style={s.featureTitle}>{title}</h3>
              <p style={s.featureDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={s.ctaSection}>
        <div style={s.ctaGlow} />
        <h2 style={s.ctaTitle}>READY TO DOMINATE<br />THE PITCH?</h2>
        <button
          style={s.ctaBtn}
          onClick={() => navigate(isAuthenticated ? '/booking' : '/login')}
        >
          BOOK YOUR SLOT NOW
          <span className="material-symbols-outlined" style={s.btnIcon}>arrow_forward</span>
        </button>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerTop}>
          <div style={s.footerBrand}>
            <div style={s.footerLogo}>{'>'}</div>
            <div>
              <p style={s.footerName}>EAGLE BOX CRICKET</p>
              <p style={s.footerTagline}>HIGH INTENSITY BOX CRICKET · HYDERABAD</p>
            </div>
          </div>
          <div style={s.footerLinks}>
            {['Home', 'Book a Slot', 'My Bookings', 'Profile'].map((l, i) => (
              <button
                key={l}
                style={s.footerLink}
                onClick={() => navigate(['/', '/booking', '/my-bookings', '/profile'][i])}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div style={s.footerBottom}>
          <span style={s.footerCopy}>© 2026 Eagle Box Cricket · EST. HYDERABAD</span>
        </div>
      </footer>

      <div style={{ height: '64px' }} />
      <BottomNav />
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#fff', fontFamily: "'Hanken Grotesk', sans-serif" },

  topBar: {
    position: 'sticky', top: 0, zIndex: 90,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 16px', height: '56px',
    backgroundColor: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #1e1e22',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoMark: {
    width: '28px', height: '28px', backgroundColor: '#BFFF00', color: '#000',
    fontWeight: 900, fontSize: '14px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: '4px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  logoText: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
    fontWeight: 700, letterSpacing: '0.12em', color: '#fff',
  },
  topRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' },
  bellIcon: { fontSize: '22px', color: '#555' },
  authBtn: {
    backgroundColor: 'transparent', border: '1px solid #333', color: '#aaa',
    padding: '7px 14px', borderRadius: '6px', fontSize: '11px',
    fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
    cursor: 'pointer', fontWeight: 600,
  },

  ticker: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 16px', backgroundColor: '#111113',
    borderBottom: '1px solid #1e1e22', overflow: 'hidden',
  },
  tickerDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    backgroundColor: '#BFFF00', flexShrink: 0,
  },
  tickerLabel: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    fontWeight: 700, color: '#BFFF00', letterSpacing: '0.1em', flexShrink: 0,
  },
  tickerText: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    color: '#666', letterSpacing: '0.05em', whiteSpace: 'nowrap',
    overflow: 'hidden', textOverflow: 'ellipsis',
  },

  hero: {
    position: 'relative', padding: '56px 16px 48px', overflow: 'hidden',
    minHeight: '560px',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    backgroundImage: "url('/hero-batsman.png')",
    backgroundSize: 'cover', backgroundPosition: 'center center',
    zIndex: 0,
  },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(13,13,13,0.65) 0%, rgba(13,13,13,0.92) 100%)',
    zIndex: 1,
  },
  heroGlow: {
    position: 'absolute', top: '-60px', left: '-40px',
    width: '300px', height: '300px', borderRadius: '50%',
    backgroundColor: 'rgba(191,255,0,0.06)', filter: 'blur(60px)',
    pointerEvents: 'none', zIndex: 2,
  },
  heroTag: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    letterSpacing: '0.2em', color: '#aaa', marginBottom: '16px',
    position: 'relative', zIndex: 2,
  },
  heroTitle: {
    fontSize: 'clamp(48px, 14vw, 88px)', fontWeight: 800,
    lineHeight: 0.9, letterSpacing: '-0.03em', color: '#fff',
    marginBottom: '20px', textTransform: 'uppercase',
    position: 'relative', zIndex: 2,
  },
  heroAccent: { color: '#BFFF00' },
  heroSub: {
    fontSize: '14px', color: '#ccc', lineHeight: 1.6,
    marginBottom: '32px', maxWidth: '340px',
    position: 'relative', zIndex: 2,
  },
  heroBtns: { display: 'flex', gap: '12px', flexWrap: 'wrap', position: 'relative', zIndex: 2 },
  primaryBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#BFFF00', color: '#000', border: 'none',
    borderRadius: '8px', padding: '14px 24px', fontSize: '13px',
    fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace",
  },
  secondaryBtn: {
    backgroundColor: 'transparent', color: '#fff',
    border: '1px solid #333', borderRadius: '8px',
    padding: '14px 20px', fontSize: '13px', fontWeight: 600,
    letterSpacing: '0.08em', cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace",
  },
  btnIcon: { fontSize: '16px' },

  section: { padding: '32px 16px' },
  sectionHead: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '20px',
  },
  sectionTag: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.2em', color: '#BFFF00', marginBottom: '4px',
  },
  sectionTitle: {
    fontSize: '18px', fontWeight: 700, color: '#fff',
    letterSpacing: '-0.01em',
  },
  viewAllBtn: {
    display: 'flex', alignItems: 'center', gap: '2px',
    background: 'none', border: 'none', color: '#BFFF00',
    fontSize: '12px', cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em',
  },
  emptySlots: { textAlign: 'center', padding: '32px 0' },
  emptyText: { color: '#444', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' },
  slotGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
  },
  slotCard: {
    position: 'relative', backgroundColor: '#161616', border: '1px solid #222',
    borderRadius: '10px', padding: '16px 14px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', gap: '4px',
    textAlign: 'left', transition: 'border-color 0.15s',
  },
  slotSession: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.12em', color: '#555',
  },
  slotTime: { fontSize: '15px', fontWeight: 700, color: '#fff' },
  slotPrice: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
    color: '#BFFF00', fontWeight: 600, marginTop: '4px',
  },
  availableDot: {
    position: 'absolute', top: '12px', right: '12px',
    width: '7px', height: '7px', borderRadius: '50%',
    backgroundColor: '#22CC66',
  },

  featureGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px',
    backgroundColor: '#1e1e22', borderRadius: '10px', overflow: 'hidden',
    marginTop: '20px',
  },
  featureCard: { backgroundColor: '#111113', padding: '20px 16px' },
  featureIcon: { fontSize: '24px', color: '#BFFF00', display: 'block', marginBottom: '10px' },
  featureTitle: {
    fontSize: '12px', fontWeight: 700, color: '#fff',
    letterSpacing: '0.06em', marginBottom: '6px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  featureDesc: { fontSize: '12px', color: '#666', lineHeight: 1.5 },

  ctaSection: {
    position: 'relative', padding: '48px 16px',
    textAlign: 'center', overflow: 'hidden',
    borderTop: '1px solid #1e1e22',
  },
  ctaGlow: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '280px', height: '200px', borderRadius: '50%',
    backgroundColor: 'rgba(191,255,0,0.05)', filter: 'blur(50px)',
    pointerEvents: 'none',
  },
  ctaTitle: {
    fontSize: 'clamp(26px, 8vw, 44px)', fontWeight: 800,
    lineHeight: 1.1, color: '#fff', letterSpacing: '-0.02em',
    marginBottom: '28px', textTransform: 'uppercase',
  },
  ctaBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#BFFF00', color: '#000', border: 'none',
    borderRadius: '8px', padding: '16px 32px', fontSize: '13px',
    fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace",
  },

  footer: { borderTop: '1px solid #1e1e22', padding: '24px 16px 16px' },
  footerTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px',
    marginBottom: '20px',
  },
  footerBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  footerLogo: {
    width: '32px', height: '32px', backgroundColor: '#BFFF00', color: '#000',
    fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: '6px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  footerName: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
    fontWeight: 700, letterSpacing: '0.1em', color: '#fff',
  },
  footerTagline: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.1em', color: '#444', marginTop: '2px',
  },
  footerLinks: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' },
  footerLink: {
    background: 'none', border: 'none', color: '#555', fontSize: '12px',
    cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
    textAlign: 'right',
  },
  footerBottom: { borderTop: '1px solid #1a1a1a', paddingTop: '16px' },
  footerCopy: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.1em', color: '#333',
  },
};
