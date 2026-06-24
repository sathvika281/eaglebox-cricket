import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPayments } from '../api/payments.api';
import { formatDateShort, formatTime } from '../utils/formatters';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

function StatusBadge({ status }) {
  const map = {
    paid:    { bg: 'rgba(34,204,102,0.1)', color: '#22CC66', border: 'rgba(34,204,102,0.3)' },
    created: { bg: 'rgba(255,140,0,0.1)',  color: '#FF8C00', border: 'rgba(255,140,0,0.3)' },
    failed:  { bg: 'rgba(255,68,68,0.1)',  color: '#FF4444', border: 'rgba(255,68,68,0.3)' },
  };
  const c = map[status] || map.created;
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
      letterSpacing: '0.12em', padding: '3px 10px', borderRadius: '20px',
      backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {status.toUpperCase()}
    </span>
  );
}

export default function PaymentHistory() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    getMyPayments()
      .then(({ data }) => setPayments(data.payments || []))
      .catch(() => setError('Failed to load payment history.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page}>
      <TopBar showBack backPath="/dashboard" />
      <div style={s.wrap}>

        <p style={s.tag}>⚡ ACCOUNT</p>
        <h1 style={s.title}>PAYMENT HISTORY</h1>
        <div style={s.divider} />
        <p style={s.sub}>All your Razorpay transactions in one place.</p>

        {loading && (
          <div style={s.loadWrap}>
            <div style={s.loadDot} />
            <span style={s.loadText}>Loading...</span>
          </div>
        )}

        {error && <div style={s.errorBanner}>{error}</div>}

        {!loading && payments.length === 0 && !error && (
          <div style={s.empty}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#333', display: 'block', marginBottom: '12px' }}>
              credit_card_off
            </span>
            <p style={s.emptyText}>No payment transactions found.</p>
            <button style={s.bookBtn} onClick={() => navigate('/booking')}>BOOK A SLOT</button>
          </div>
        )}

        {!loading && payments.length > 0 && (
          <div style={s.list}>
            {payments.map((p) => (
              <div key={p.id} style={s.card}>
                <div style={s.cardTop}>
                  <div>
                    <p style={s.cardLabel}>BOOKING REF</p>
                    <p style={s.cardRef}>{p.booking_ref}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div style={s.cardDivider} />

                <div style={s.cardGrid}>
                  <div>
                    <p style={s.cardLabel}>DATE</p>
                    <p style={s.cardVal}>{formatDateShort(p.slot_date)}</p>
                  </div>
                  <div>
                    <p style={s.cardLabel}>TIME</p>
                    <p style={s.cardVal}>{formatTime(p.start_time)} – {formatTime(p.end_time)}</p>
                  </div>
                  <div>
                    <p style={s.cardLabel}>AMOUNT</p>
                    <p style={{ ...s.cardVal, color: '#BFFF00' }}>₹{p.amount}</p>
                  </div>
                  <div>
                    <p style={s.cardLabel}>PAID ON</p>
                    <p style={s.cardVal}>
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN') : '—'}
                    </p>
                  </div>
                </div>

                {p.razorpay_payment_id && (
                  <p style={s.txnId}>Txn: {p.razorpay_payment_id}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#fff', fontFamily: "'Hanken Grotesk', sans-serif" },
  wrap: { padding: '24px 16px 100px', maxWidth: '540px', margin: '0 auto' },
  tag: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    letterSpacing: '0.2em', color: '#BFFF00', marginBottom: '6px',
  },
  title: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(22px,6vw,28px)',
    fontWeight: 700, color: '#fff', letterSpacing: '0.04em', marginBottom: '8px',
  },
  divider: { width: '40px', height: '2px', backgroundColor: '#BFFF00', marginBottom: '10px', borderRadius: '2px' },
  sub: { fontSize: '13px', color: '#666', marginBottom: '24px' },
  loadWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '48px 0' },
  loadDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#BFFF00' },
  loadText: { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#444', letterSpacing: '0.1em' },
  errorBanner: {
    backgroundColor: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
    borderRadius: '8px', color: '#FF4444', fontSize: '13px', padding: '12px',
  },
  empty: { textAlign: 'center', padding: '48px 0' },
  emptyText: { color: '#555', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', marginBottom: '20px' },
  bookBtn: {
    backgroundColor: '#BFFF00', color: '#000', border: 'none',
    borderRadius: '8px', padding: '12px 28px',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
    fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    backgroundColor: '#161616', border: '1px solid #222',
    borderRadius: '12px', padding: '16px 20px',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  cardLabel: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.15em', color: '#555', marginBottom: '4px',
  },
  cardRef: { fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', fontWeight: 700, color: '#BFFF00' },
  cardDivider: { height: '1px', backgroundColor: '#222', marginBottom: '12px' },
  cardGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  cardVal: { fontSize: '13px', fontWeight: 600, color: '#fff' },
  txnId: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    color: '#444', marginTop: '12px', wordBreak: 'break-all',
  },
};
