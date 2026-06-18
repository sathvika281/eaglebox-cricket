import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ title, showBack = false, backPath = '/' }) {
  const navigate      = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header style={s.bar}>
      {showBack ? (
        <button style={s.backBtn} onClick={() => navigate(backPath)}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
        </button>
      ) : (
        <button style={s.logoBtn} onClick={() => navigate('/')}>
          <span style={s.logoMark}>{'>'}</span>
          <span style={s.logoText}>EAGLE BOX CRICKET</span>
        </button>
      )}

      {title && <span style={s.title}>{title}</span>}

      <div style={s.right}>
        <button style={s.iconBtn}>
          <span className="material-symbols-outlined" style={s.bellIcon}>notifications</span>
        </button>
        {isAuthenticated && (
          <button style={s.avatarBtn} onClick={() => navigate('/profile')}>
            <span style={s.avatarText}>{initials}</span>
          </button>
        )}
      </div>
    </header>
  );
}

const s = {
  bar: {
    position: 'sticky',
    top: 0,
    zIndex: 90,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    height: '56px',
    backgroundColor: '#0D0D0D',
    borderBottom: '1px solid #1e1e22',
  },
  logoBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  logoMark: {
    width: '28px',
    height: '28px',
    backgroundColor: '#BFFF00',
    color: '#000',
    fontWeight: 900,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  logoText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: '#fff',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px',
    letterSpacing: '0.15em',
    color: '#888',
    textTransform: 'uppercase',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: '22px',
    color: '#666',
  },
  avatarBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#BFFF00',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px',
    fontWeight: 700,
    color: '#000',
  },
};
