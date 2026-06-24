import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUnreadCount } from '../../api/notifications.api';

export default function TopBar({ title }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    getUnreadCount().then(({ data }) => setUnread(data.count || 0)).catch(() => {});
    const t = setInterval(() =>
      getUnreadCount().then(({ data }) => setUnread(data.count || 0)).catch(() => {}), 30000);
    return () => clearInterval(t);
  }, [isAuthenticated]);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header style={s.bar}>
      {/* Left: back arrow (on sub-pages) OR logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {title ? (
          <button style={s.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_back</span>
          </button>
        ) : (
          <button style={s.logoBtn} onClick={() => navigate('/dashboard')}>
            <span style={s.logoMark}>{'>'}</span>
            <span style={s.logoText}>EAGLE BOX CRICKET</span>
          </button>
        )}
        {title && (
          <span style={s.pageTitle}>{title}</span>
        )}
      </div>

      {/* Right: notifications + avatar */}
      <div style={s.right}>
        <button style={{ ...s.iconBtn, position: 'relative' }} onClick={() => navigate('/notifications')}>
          <span className="material-symbols-outlined" style={s.bellIcon}>notifications</span>
          {unread > 0 && (
            <span style={s.badge}>{unread > 9 ? '9+' : unread}</span>
          )}
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
    position: 'sticky', top: 0, zIndex: 90,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', height: 56,
    backgroundColor: '#0D0D0D', borderBottom: '1px solid #1e1e22',
  },
  backBtn: {
    background: 'none', border: 'none', color: '#fff',
    cursor: 'pointer', padding: 4,
    display: 'flex', alignItems: 'center', flexShrink: 0,
  },
  pageTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, letterSpacing: '0.12em',
    color: '#fff', fontWeight: 700,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  logoBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  },
  logoMark: {
    width: 28, height: 28, background: '#BFFF00', color: '#000',
    fontWeight: 900, fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 4, fontFamily: "'JetBrains Mono', monospace",
  },
  logoText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#fff',
  },
  right:  { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 4, display: 'flex', alignItems: 'center',
  },
  bellIcon: { fontSize: 22, color: '#666' },
  badge: {
    position: 'absolute', top: 0, right: 0,
    background: '#FF4444', color: '#fff', borderRadius: '50%',
    width: 16, height: 16, fontSize: 9, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'monospace',
  },
  avatarBtn: {
    width: 32, height: 32, borderRadius: '50%',
    background: '#BFFF00', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, fontWeight: 700, color: '#000',
  },
};
