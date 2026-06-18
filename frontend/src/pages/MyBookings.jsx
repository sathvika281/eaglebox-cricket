import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings } from '../api/bookings.api';
import { formatDateShort, formatSlotTime, formatCurrency } from '../utils/formatters';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const STATUS_CONFIG = {
  pending:   { color: '#FF8C00', bg: 'rgba(255,140,0,0.1)',   label: 'PENDING',   icon: 'pending'    },
  confirmed: { color: '#22CC66', bg: 'rgba(34,204,102,0.1)',  label: 'CONFIRMED', icon: 'verified'   },
  cancelled: { color: '#FF4444', bg: 'rgba(255,68,68,0.1)',   label: 'CANCELLED', icon: 'cancel'     },
  completed: { color: '#888',    bg: 'rgba(136,136,136,0.1)', label: 'COMPLETED', icon: 'check_circle'},
};

const FILTER_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeFilter, setFilter] = useState('ALL');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (activeFilter !== 'ALL') params.status = activeFilter.toLowerCase();

    getMyBookings(params)
      .then(({ data }) => {
        setBookings(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [page, activeFilter]);

  const handleFilterChange = (f) => { setFilter(f); setPage(1); };

  return (
    <div style={s.page}>
      <TopBar title="MY BOOKINGS" />

      {/* Header banner */}
      <div style={s.banner}>
        <div style={s.bannerBg} />
        <div style={s.bannerOverlay} />
        <p style={s.bannerTag}>BOOKING HISTORY</p>
        <h2 style={s.bannerTitle}>MY BOOKINGS</h2>
        <p style={s.bannerSub}>Track all your arena sessions</p>
      </div>

      {/* Filter tabs */}
      <div style={s.filterWrap}>
        {FILTER_TABS.map((f) => (
          <button
            key={f}
            style={{ ...s.filterTab, ...(activeFilter === f ? s.filterTabActive : {}) }}
            onClick={() => handleFilterChange(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={s.content}>
        {loading ? (
          <div style={s.loadWrap}>
            <div style={s.loadDot} />
            <span style={s.loadText}>LOADING BOOKINGS...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div style={s.empty}>
            <span className="material-symbols-outlined" style={s.emptyIcon}>receipt_long</span>
            <h3 style={s.emptyTitle}>
              {activeFilter === 'ALL' ? 'No bookings yet' : `No ${activeFilter.toLowerCase()} bookings`}
            </h3>
            <p style={s.emptySub}>
              {activeFilter === 'ALL'
                ? 'Book your first slot and start playing.'
                : 'Try a different filter.'}
            </p>
            {activeFilter === 'ALL' && (
              <button style={s.bookNowBtn} onClick={() => navigate('/booking')}>
                BOOK NOW
              </button>
            )}
          </div>
        ) : (
          <>
            <p style={s.resultCount}>
              {bookings.length} BOOKING{bookings.length !== 1 ? 'S' : ''}
              {activeFilter !== 'ALL' ? ` · ${activeFilter}` : ''}
            </p>

            <div style={s.list}>
              {bookings.map((b) => {
                const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                return (
                  <div key={b.id} style={s.card}>
                    {/* Card top: ref + status */}
                    <div style={s.cardTop}>
                      <div>
                        <span style={s.refText}>{b.booking_ref}</span>
                        <span style={s.createdAt}>
                          Booked {formatDateShort(b.created_at?.split('T')[0])}
                        </span>
                      </div>
                      <div style={{ ...s.badge, color: cfg.color, backgroundColor: cfg.bg }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>{cfg.icon}</span>
                        {cfg.label}
                      </div>
                    </div>

                    <div style={s.cardDivider} />

                    {/* Slot info grid */}
                    <div style={s.cardGrid}>
                      <div style={s.field}>
                        <span style={s.fieldLabel}>DATE</span>
                        <span style={s.fieldValue}>{formatDateShort(b.slot_date)}</span>
                      </div>
                      <div style={s.field}>
                        <span style={s.fieldLabel}>TIME</span>
                        <span style={s.fieldValue}>{formatSlotTime(b.start_time, b.end_time)}</span>
                      </div>
                      <div style={s.field}>
                        <span style={s.fieldLabel}>VENUE</span>
                        <span style={s.fieldValue}>Main Arena</span>
                      </div>
                      <div style={s.field}>
                        <span style={s.fieldLabel}>AMOUNT</span>
                        <span style={{ ...s.fieldValue, color: '#BFFF00' }}>
                          {formatCurrency(b.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={s.pagination}>
                <button
                  style={{ ...s.pageBtn, ...(page <= 1 ? s.pageBtnDisabled : {}) }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                </button>
                <span style={s.pageInfo}>
                  {page} / {totalPages}
                </span>
                <button
                  style={{ ...s.pageBtn, ...(page >= totalPages ? s.pageBtnDisabled : {}) }}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ height: '80px' }} />
      <BottomNav />
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#fff', fontFamily: "'Hanken Grotesk', sans-serif" },

  banner: {
    position: 'relative', overflow: 'hidden',
    padding: '28px 16px 24px', minHeight: '160px',
    borderBottom: '1px solid #1e1e22',
  },
  bannerBg: {
    position: 'absolute', inset: 0,
    backgroundImage: "url('/bg-7-apex-arena.png')",
    backgroundSize: 'cover', backgroundPosition: 'center center',
    zIndex: 0,
  },
  bannerOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(13,13,13,0.5) 0%, rgba(13,13,13,0.88) 100%)',
    zIndex: 1,
  },
  bannerTag: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.2em', color: '#BFFF00', marginBottom: '6px',
    position: 'relative', zIndex: 2,
  },
  bannerTitle: {
    fontSize: '28px', fontWeight: 800, color: '#fff',
    letterSpacing: '-0.02em', lineHeight: 1,
    position: 'relative', zIndex: 2,
  },
  bannerSub: {
    fontSize: '13px', color: '#ccc', marginTop: '6px',
    position: 'relative', zIndex: 2,
  },

  filterWrap: {
    display: 'flex', gap: '6px', padding: '12px 16px',
    overflowX: 'auto', borderBottom: '1px solid #1e1e22',
  },
  filterTab: {
    flexShrink: 0, padding: '7px 14px', borderRadius: '20px',
    backgroundColor: '#161616', border: '1px solid #222',
    color: '#555', fontSize: '10px', cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em',
    fontWeight: 600, whiteSpace: 'nowrap',
  },
  filterTabActive: {
    backgroundColor: '#BFFF00', borderColor: '#BFFF00', color: '#000',
  },

  content: { padding: '16px' },
  loadWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '14px', padding: '60px 0',
  },
  loadDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#BFFF00' },
  loadText: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    letterSpacing: '0.15em', color: '#444',
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '8px', padding: '60px 0', textAlign: 'center',
  },
  emptyIcon: { fontSize: '48px', color: '#2a2a2a', marginBottom: '8px' },
  emptyTitle: { fontSize: '18px', fontWeight: 700, color: '#fff' },
  emptySub: { fontSize: '13px', color: '#555', maxWidth: '220px' },
  bookNowBtn: {
    marginTop: '12px', backgroundColor: '#BFFF00', color: '#000',
    border: 'none', borderRadius: '8px', padding: '12px 28px',
    fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
    cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
  },

  resultCount: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    letterSpacing: '0.15em', color: '#555', marginBottom: '14px',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },

  card: {
    backgroundColor: '#161616', border: '1px solid #222',
    borderRadius: '12px', padding: '16px',
  },
  cardTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '12px',
  },
  refText: {
    display: 'block', fontFamily: "'JetBrains Mono', monospace",
    fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '3px',
  },
  createdAt: { fontSize: '11px', color: '#555' },
  badge: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.1em', fontWeight: 700, padding: '5px 10px',
    borderRadius: '20px', whiteSpace: 'nowrap',
  },
  cardDivider: { height: '1px', backgroundColor: '#222', marginBottom: '12px' },
  cardGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '3px' },
  fieldLabel: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.12em', color: '#555',
  },
  fieldValue: { fontSize: '13px', color: '#ccc', fontWeight: 500 },

  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '16px', padding: '24px 0',
  },
  pageBtn: {
    width: '36px', height: '36px', borderRadius: '50%',
    backgroundColor: '#161616', border: '1px solid #222',
    color: '#fff', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  pageBtnDisabled: { opacity: 0.3, cursor: 'not-allowed' },
  pageInfo: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
    color: '#555', letterSpacing: '0.1em',
  },
};
