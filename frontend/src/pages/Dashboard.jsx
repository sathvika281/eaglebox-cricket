import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings } from '../api/bookings.api';
import { formatDateShort, formatSlotTime } from '../utils/formatters';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const STATUS_CONFIG = {
  pending:   { color: '#FF8C00', bg: 'rgba(255,140,0,0.1)',   label: 'PENDING'   },
  confirmed: { color: '#22CC66', bg: 'rgba(34,204,102,0.1)',  label: 'CONFIRMED' },
  cancelled: { color: '#FF4444', bg: 'rgba(255,68,68,0.1)',   label: 'CANCELLED' },
  completed: { color: '#888',    bg: 'rgba(136,136,136,0.1)', label: 'COMPLETED' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [bookings, setBookings] = useState([]);
  const [stats, setStats]       = useState({ total: 0, confirmed: 0, pending: 0 });
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getMyBookings({ limit: 50 })
      .then(({ data }) => {
        const list = data.data || [];
        setBookings(list.slice(0, 3));
        setStats({
          total:     list.length,
          confirmed: list.filter((b) => b.status === 'confirmed' || b.status === 'completed').length,
          pending:   list.filter((b) => b.status === 'pending').length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Player';

  return (
    <div style={s.page}>
      <TopBar />

      {/* Greeting */}
      <div style={s.greeting}>
        <div style={s.greetBg} />
        <div style={s.greetOverlay} />
        <p style={s.greetTag}>WELCOME BACK</p>
        <h1 style={s.greetName}>{firstName.toUpperCase()}</h1>
        <p style={s.greetRole}>{user?.email}</p>
      </div>

      {/* Stats row */}
      <div style={s.statsRow}>
        {[
          { label: 'TOTAL BOOKINGS', value: loading ? '—' : stats.total,     icon: 'receipt_long' },
          { label: 'CONFIRMED',      value: loading ? '—' : stats.confirmed,  icon: 'verified',    highlight: true },
          { label: 'PENDING',        value: loading ? '—' : stats.pending,    icon: 'pending'      },
        ].map(({ label, value, icon, highlight }) => (
          <div key={label} style={{ ...s.statCard, ...(highlight ? s.statCardHL : {}) }}>
            <span className="material-symbols-outlined" style={{ ...s.statIcon, ...(highlight ? s.statIconHL : {}) }}>
              {icon}
            </span>
            <span style={{ ...s.statValue, ...(highlight ? s.statValueHL : {}) }}>{value}</span>
            <span style={s.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* OPS CENTER */}
      <div style={s.section}>
        <p style={s.sectionTag}>OPS CENTER</p>
        <div style={s.opsGrid}>
          <button style={s.opsPrimary} onClick={() => navigate('/booking')}>
            <span className="material-symbols-outlined" style={s.opsIcon}>sports_cricket</span>
            <div>
              <p style={s.opsBtnTitle}>BOOK ARENA SLOT</p>
              <p style={s.opsBtnSub}>Reserve your pitch time</p>
            </div>
            <span className="material-symbols-outlined" style={s.opsArrow}>arrow_forward</span>
          </button>
          <button style={s.opsSecondary} onClick={() => navigate('/my-bookings')}>
            <span className="material-symbols-outlined" style={s.opsSecIcon}>receipt_long</span>
            <div>
              <p style={s.opsSecTitle}>MY BOOKINGS</p>
              <p style={s.opsSecSub}>View your booking history</p>
            </div>
            <span className="material-symbols-outlined" style={{ ...s.opsArrow, color: '#555' }}>arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Recent bookings */}
      <div style={s.section}>
        <div style={s.recentHead}>
          <p style={s.sectionTag}>RECENT BOOKINGS</p>
          {bookings.length > 0 && (
            <button style={s.viewAllBtn} onClick={() => navigate('/my-bookings')}>
              VIEW ALL
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
            </button>
          )}
        </div>

        {loading ? (
          <div style={s.loadWrap}>
            <div style={s.loadDot} />
          </div>
        ) : bookings.length === 0 ? (
          <div style={s.empty}>
            <span className="material-symbols-outlined" style={s.emptyIcon}>calendar_today</span>
            <p style={s.emptyTitle}>No bookings yet</p>
            <p style={s.emptySub}>Book your first arena slot and start playing</p>
            <button style={s.emptyBtn} onClick={() => navigate('/booking')}>
              BOOK NOW
            </button>
          </div>
        ) : (
          <div style={s.bookingList}>
            {bookings.map((b) => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              return (
                <div key={b.id} style={s.bookingCard}>
                  <div style={s.bookingLeft}>
                    <span style={s.bookingRef}>{b.booking_ref}</span>
                    <span style={s.bookingDate}>{formatDateShort(b.slot_date)}</span>
                    <span style={s.bookingTime}>
                      {formatSlotTime(b.start_time, b.end_time)}
                    </span>
                  </div>
                  <div style={{ ...s.statusBadge, color: cfg.color, backgroundColor: cfg.bg }}>
                    {cfg.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ height: '80px' }} />
      <BottomNav />
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#fff', fontFamily: "'Hanken Grotesk', sans-serif" },

  greeting: {
    padding: '32px 16px 28px',
    borderBottom: '1px solid #1e1e22',
    position: 'relative', overflow: 'hidden',
    minHeight: '160px',
  },
  greetBg: {
    position: 'absolute', inset: 0,
    backgroundImage: "url('/bg-5-apex-arena.png')",
    backgroundSize: 'cover', backgroundPosition: 'center center',
    zIndex: 0,
  },
  greetOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0.90) 100%)',
    zIndex: 1,
  },
  greetTag: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    letterSpacing: '0.2em', color: '#BFFF00', marginBottom: '4px',
    position: 'relative', zIndex: 2,
  },
  greetName: {
    fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em',
    color: '#fff', lineHeight: 1,
    position: 'relative', zIndex: 2,
  },
  greetRole: { fontSize: '13px', color: '#ccc', marginTop: '4px', position: 'relative', zIndex: 2 },

  statsRow: {
    display: 'flex', gap: '10px', padding: '16px',
    borderBottom: '1px solid #1e1e22',
  },
  statCard: {
    flex: 1, backgroundColor: '#161616', border: '1px solid #222',
    borderRadius: '10px', padding: '14px 10px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
  },
  statCardHL: { backgroundColor: 'rgba(191,255,0,0.06)', borderColor: 'rgba(191,255,0,0.2)' },
  statIcon: { fontSize: '20px', color: '#444' },
  statIconHL: { color: '#BFFF00' },
  statValue: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '22px',
    fontWeight: 700, color: '#fff',
  },
  statValueHL: { color: '#BFFF00' },
  statLabel: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '8px',
    letterSpacing: '0.1em', color: '#555', textAlign: 'center',
  },

  section: { padding: '20px 16px' },
  sectionTag: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.2em', color: '#BFFF00', marginBottom: '12px',
  },
  recentHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  viewAllBtn: {
    display: 'flex', alignItems: 'center', gap: '2px',
    background: 'none', border: 'none', color: '#BFFF00',
    fontSize: '11px', cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em',
  },

  opsGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  opsPrimary: {
    display: 'flex', alignItems: 'center', gap: '14px',
    backgroundColor: '#BFFF00', border: 'none', borderRadius: '12px',
    padding: '16px 18px', cursor: 'pointer', textAlign: 'left',
  },
  opsIcon: { fontSize: '28px', color: '#000', flexShrink: 0 },
  opsBtnTitle: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
    fontWeight: 700, letterSpacing: '0.08em', color: '#000',
  },
  opsBtnSub: { fontSize: '11px', color: 'rgba(0,0,0,0.6)', marginTop: '2px' },
  opsArrow: { fontSize: '20px', color: '#000', marginLeft: 'auto' },
  opsSecondary: {
    display: 'flex', alignItems: 'center', gap: '14px',
    backgroundColor: '#161616', border: '1px solid #222',
    borderRadius: '12px', padding: '16px 18px', cursor: 'pointer', textAlign: 'left',
  },
  opsSecIcon: { fontSize: '28px', color: '#555', flexShrink: 0 },
  opsSecTitle: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
    fontWeight: 700, letterSpacing: '0.08em', color: '#fff',
  },
  opsSecSub: { fontSize: '11px', color: '#555', marginTop: '2px' },

  loadWrap: { display: 'flex', justifyContent: 'center', padding: '32px 0' },
  loadDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#BFFF00' },

  empty: {
    textAlign: 'center', padding: '32px 0',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
  },
  emptyIcon: { fontSize: '36px', color: '#333' },
  emptyTitle: { fontSize: '16px', fontWeight: 600, color: '#fff' },
  emptySub: { fontSize: '13px', color: '#555', maxWidth: '220px' },
  emptyBtn: {
    marginTop: '12px', backgroundColor: '#BFFF00', color: '#000',
    border: 'none', borderRadius: '8px', padding: '12px 24px',
    fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
    cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
  },

  bookingList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  bookingCard: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#161616', border: '1px solid #222',
    borderRadius: '10px', padding: '14px 16px',
  },
  bookingLeft: { display: 'flex', flexDirection: 'column', gap: '3px' },
  bookingRef: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
    fontWeight: 700, color: '#fff',
  },
  bookingDate: { fontSize: '12px', color: '#888' },
  bookingTime: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#555',
  },
  statusBadge: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.12em', fontWeight: 700, padding: '5px 10px',
    borderRadius: '20px',
  },
};
