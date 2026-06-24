import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { label: 'HOME',       icon: 'home',           path: '/dashboard'  },
  { label: 'BOOK',       icon: 'calendar_today', path: '/booking'    },
  { label: 'BOOKINGS',   icon: 'receipt_long',   path: '/my-bookings'},
  { label: 'TEAMS',      icon: 'groups',         path: '/teams'      },
  { label: 'MATCHES',    icon: 'sports_cricket', path: '/matches'    },
  { label: 'CRICKET ID', icon: 'badge',          path: '/cricket-id' },
  { label: 'PROFILE',    icon: 'person',         path: '/profile'    },
];

export default function BottomNav() {
  const navigate       = useNavigate();
  const { pathname }   = useLocation();

  const isActive = (path) =>
    path === '/dashboard'
      ? pathname === '/dashboard' || pathname === '/'
      : pathname.startsWith(path);

  return (
    <>
      {/* ── Mobile bottom nav ── */}
      <nav className="ebc-bottom-nav" style={s.bottom}>
        {TABS.slice(0, 4).map(({ label, icon, path }) => {
          const active = isActive(path);
          return (
            <button key={path} style={s.tab} onClick={() => navigate(path)}>
              <span className="material-symbols-outlined"
                style={{ ...s.icon, ...(active ? s.iconOn : {}) }}>
                {icon}
              </span>
              <span style={{ ...s.tabLabel, ...(active ? s.labelOn : {}) }}>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Desktop sidebar ── */}
      <nav className="ebc-sidebar" style={s.sidebar}>
        {/* Logo */}
        <button style={s.sideLogoBtn} onClick={() => navigate('/dashboard')}>
          <span style={s.sideLogoMark}>{'>'}</span>
          <div>
            <div style={s.sideLogoTitle}>EAGLE BOX</div>
            <div style={s.sideLogoSub}>CRICKET</div>
          </div>
        </button>

        <div style={s.divider} />

        {/* Nav items */}
        {TABS.map(({ label, icon, path }) => {
          const active = isActive(path);
          return (
            <button key={path}
              style={{ ...s.sideItem, ...(active ? s.sideItemOn : {}) }}
              onClick={() => navigate(path)}>
              <span className="material-symbols-outlined"
                style={{ ...s.sideIcon, ...(active ? s.sideIconOn : {}) }}>
                {icon}
              </span>
              <span style={{ ...s.sideLabel, ...(active ? s.sideLabelOn : {}) }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

const s = {
  /* ── Bottom nav ── */
  bottom: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    height: 64, background: '#111113',
    borderTop: '1px solid #222', zIndex: 100,
    alignItems: 'stretch',
  },
  tab: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 2,
    background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
  },
  icon:     { fontSize: 22, color: '#555' },
  iconOn:   { color: '#BFFF00' },
  tabLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '0.1em', color: '#444' },
  labelOn:  { color: '#BFFF00' },

  /* ── Sidebar ── */
  sidebar: {
    position: 'fixed', top: 0, left: 0, width: 220,
    height: '100vh', background: '#0D0D0D',
    borderRight: '1px solid #1e1e22',
    flexDirection: 'column', alignItems: 'stretch',
    padding: '0 0 24px', zIndex: 100, overflowY: 'auto',
  },
  sideLogoBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '20px 20px 16px', textAlign: 'left',
  },
  sideLogoMark: {
    width: 36, height: 36, background: '#BFFF00', color: '#000',
    fontFamily: "'JetBrains Mono', monospace", fontWeight: 900, fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, flexShrink: 0,
  },
  sideLogoTitle: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
    fontWeight: 700, color: '#fff', letterSpacing: '0.1em',
  },
  sideLogoSub: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
    color: '#555', letterSpacing: '0.15em', marginTop: 2,
  },
  divider: { height: 1, background: '#1e1e22', margin: '0 16px 8px' },
  sideItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '11px 20px', margin: '1px 8px',
    borderRadius: 8, textAlign: 'left',
  },
  sideItemOn:   { background: 'rgba(191,255,0,0.08)' },
  sideIcon:     { fontSize: 20, color: '#555' },
  sideIconOn:   { color: '#BFFF00' },
  sideLabel:    { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.08em', color: '#555', fontWeight: 600 },
  sideLabelOn:  { color: '#fff' },
};
