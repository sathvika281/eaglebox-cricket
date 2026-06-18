import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { label: 'HOME',        icon: 'home',         path: '/'            },
  { label: 'BOOK',        icon: 'calendar_today', path: '/booking'   },
  { label: 'BOOKINGS',    icon: 'receipt_long', path: '/my-bookings' },
  { label: 'PROFILE',     icon: 'person',       path: '/profile'     },
];

export default function BottomNav() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav style={s.nav}>
      {TABS.map(({ label, icon, path }) => {
        const active = pathname === path || (path !== '/' && pathname.startsWith(path));
        return (
          <button key={path} style={s.tab} onClick={() => navigate(path)}>
            <span
              className="material-symbols-outlined"
              style={{ ...s.icon, ...(active ? s.iconActive : {}) }}
            >
              {icon}
            </span>
            <span style={{ ...s.label, ...(active ? s.labelActive : {}) }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const s = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '64px',
    backgroundColor: '#111113',
    borderTop: '1px solid #222',
    display: 'flex',
    zIndex: 100,
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 0',
  },
  icon: {
    fontSize: '22px',
    color: '#555',
    transition: 'color 0.15s',
  },
  iconActive: {
    color: '#BFFF00',
  },
  label: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.12em',
    color: '#444',
    transition: 'color 0.15s',
  },
  labelActive: {
    color: '#BFFF00',
  },
};
