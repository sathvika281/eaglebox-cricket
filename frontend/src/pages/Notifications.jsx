import React, { useState, useEffect, useCallback } from 'react';
import { getNotifications, markRead, markAllRead } from '../api/notifications.api';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const TYPE_CONFIG = {
  PAYMENT_SUCCESS:  { icon: 'payments',      color: '#22CC66' },
  BOOKING_CONFIRMED:{ icon: 'check_circle',  color: '#BFFF00' },
  BOOKING_CANCELLED:{ icon: 'cancel',        color: '#FF4444' },
  BOOKING_REMINDER: { icon: 'alarm',         color: '#7B61FF' },
  DEFAULT:          { icon: 'notifications', color: '#aaa'    },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [unread, setUnread]     = useState(0);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getNotifications({ limit: 50 });
      setNotifications(data.data || []);
      setUnread((data.data || []).filter(n => !n.is_read).length);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleRead = async (id) => {
    try { await markRead(id); fetch(); } catch { }
  };

  const handleReadAll = async () => {
    try { await markAllRead(); fetch(); } catch { }
  };

  const S = {
    page:  { minHeight: '100vh', background: '#0D0D0D', color: '#fff', paddingBottom: 80, fontFamily: "'JetBrains Mono', monospace" },
    body:  { padding: 16 },
    card:  (read) => ({ background: read ? '#111' : '#1a1a1a', border: `1px solid ${read ? '#1a1a1a' : '#2a2a2a'}`, borderRadius: 12, padding: 14, marginBottom: 10, cursor: read ? 'default' : 'pointer', opacity: read ? 0.7 : 1 }),
  };

  return (
    <div style={S.page}>
      <TopBar title="NOTIFICATIONS" />
      <div style={S.body}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: '#aaa', fontSize: 12 }}>{unread} unread</div>
          {unread > 0 && (
            <button onClick={handleReadAll} style={{ background: 'transparent', border: '1px solid #333', color: '#BFFF00', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
              MARK ALL READ
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#555', padding: 40 }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#BFFF00', display: 'block', marginBottom: 12 }}>notifications</span>
            <div style={{ color: '#aaa' }}>No notifications yet</div>
          </div>
        ) : (
          notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.DEFAULT;
            return (
              <div key={n.id} style={S.card(n.is_read)} onClick={() => !n.is_read && handleRead(n.id)}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, flexShrink: 0, color: cfg.color }}>{cfg.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: n.is_read ? 400 : 700, fontSize: 13, color: n.is_read ? '#aaa' : '#fff' }}>
                        {n.subject || n.type}
                      </div>
                      {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0, marginTop: 3 }} />}
                    </div>
                    <div style={{ color: '#888', fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ color: '#444', fontSize: 11, marginTop: 6 }}>
                      {new Date(n.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <BottomNav />
    </div>
  );
}
