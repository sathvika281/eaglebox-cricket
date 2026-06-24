import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatDateShort, formatTime } from '../utils/formatters';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

export default function BookingPass() {
  const { bookingId } = useParams();
  const navigate      = useNavigate();
  const imgRef        = useRef(null);

  const [booking, setBooking] = useState(null);
  const [qr, setQR]           = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/api/v1/bookings/${bookingId}`),
      api.get(`/api/v1/bookings/${bookingId}/qr`),
    ])
      .then(([bRes, qrRes]) => {
        setBooking(bRes.data.booking);
        setQR(qrRes.data.qr);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load booking pass.');
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href     = qr;
    link.download = `EBC-Pass-${booking?.booking_ref || bookingId}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div style={s.page}>
        <TopBar showBack backPath="/my-bookings" />
        <div style={s.centered}>
          <div style={s.loadDot} />
          <p style={s.loadText}>Loading pass...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.page}>
        <TopBar showBack backPath="/my-bookings" />
        <div style={s.centered}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#FF4444', display: 'block', marginBottom: '12px' }}>error</span>
          <p style={s.errorText}>{error}</p>
          <button style={s.backBtn} onClick={() => navigate('/my-bookings')}>GO TO MY BOOKINGS</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={s.page}>
      <TopBar showBack backPath="/my-bookings" />
      <div style={s.wrap}>

        <p style={s.tag}>⚡ DIGITAL ENTRY PASS</p>
        <h1 style={s.title}>BOOKING PASS</h1>
        <div style={s.divider} />

        <div style={s.passCard}>

          <div style={s.passHeader}>
            <div>
              <p style={s.passLabel}>EAGLE BOX CRICKET</p>
              <p style={s.passRef}>{booking.booking_ref}</p>
            </div>
            <div style={s.confirmedBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px', marginRight: '4px' }}>verified</span>
              CONFIRMED
            </div>
          </div>

          <div style={s.passDivider} />

          <div style={s.passGrid}>
            <div style={s.passField}>
              <p style={s.passLabel}>CUSTOMER</p>
              <p style={s.passValue}>{booking.customer_name}</p>
            </div>
            <div style={s.passField}>
              <p style={s.passLabel}>VENUE</p>
              <p style={s.passValue}>Main Arena</p>
            </div>
            <div style={s.passField}>
              <p style={s.passLabel}>DATE</p>
              <p style={s.passValue}>{formatDateShort(booking.slot_date)}</p>
            </div>
            <div style={s.passField}>
              <p style={s.passLabel}>TIME</p>
              <p style={s.passValue}>{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</p>
            </div>
            <div style={s.passField}>
              <p style={s.passLabel}>PLAYERS</p>
              <p style={s.passValue}>{booking.num_players}</p>
            </div>
            <div style={s.passField}>
              <p style={s.passLabel}>AMOUNT PAID</p>
              <p style={{ ...s.passValue, color: '#BFFF00' }}>₹{booking.total_amount}</p>
            </div>
          </div>

          <div style={s.passDivider} />

          <div style={s.qrSection}>
            <p style={s.passLabel}>SCAN TO VERIFY AT VENUE</p>
            {qr && (
              <img
                ref={imgRef}
                src={qr}
                alt="Booking QR Code"
                style={s.qrImg}
              />
            )}
            <p style={s.qrNote}>
              This QR code uniquely identifies your booking.
            </p>
          </div>

        </div>

        <button style={s.downloadBtn} onClick={handleDownload} disabled={!qr}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '8px' }}>download</span>
          DOWNLOAD QR PASS
        </button>
        <button style={s.secondaryBtn} onClick={() => navigate('/my-bookings')}>
          VIEW ALL BOOKINGS
        </button>

      </div>
      <BottomNav />
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#fff', fontFamily: "'Hanken Grotesk', sans-serif" },
  wrap: { padding: '24px 16px 100px', maxWidth: '480px', margin: '0 auto' },

  centered: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', gap: '12px',
  },
  loadDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#BFFF00' },
  loadText: { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#444', letterSpacing: '0.1em' },
  errorText: { color: '#FF4444', fontSize: '14px', textAlign: 'center', marginBottom: '20px' },
  backBtn: {
    backgroundColor: '#BFFF00', color: '#000', border: 'none',
    borderRadius: '8px', padding: '12px 24px',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
    fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer',
  },

  tag: { fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.2em', color: '#BFFF00', marginBottom: '6px' },
  title: { fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(22px,6vw,28px)', fontWeight: 700, color: '#fff', marginBottom: '8px' },
  divider: { width: '40px', height: '2px', backgroundColor: '#BFFF00', marginBottom: '24px', borderRadius: '2px' },

  passCard: {
    backgroundColor: '#161616', border: '1px solid #2a2a2a',
    borderRadius: '16px', padding: '24px', marginBottom: '16px',
  },
  passHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  passRef: { fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 700, color: '#BFFF00', marginTop: '4px' },
  confirmedBadge: {
    display: 'flex', alignItems: 'center',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.1em', color: '#22CC66',
    backgroundColor: 'rgba(34,204,102,0.1)', border: '1px solid rgba(34,204,102,0.3)',
    borderRadius: '20px', padding: '4px 10px',
  },
  passDivider: { height: '1px', backgroundColor: '#222', margin: '16px 0' },
  passGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  passField: {},
  passLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#555', marginBottom: '4px' },
  passValue: { fontSize: '14px', fontWeight: 600, color: '#fff' },

  qrSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  qrImg: {
    width: '200px', height: '200px', borderRadius: '12px',
    border: '4px solid #BFFF00', padding: '8px', backgroundColor: '#fff',
  },
  qrNote: { fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', color: '#444', textAlign: 'center' },

  downloadBtn: {
    width: '100%', backgroundColor: '#BFFF00', color: '#000',
    border: 'none', borderRadius: '10px', padding: '16px',
    fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em',
    fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '10px',
  },
  secondaryBtn: {
    width: '100%', backgroundColor: 'transparent', color: '#fff',
    border: '1px solid #333', borderRadius: '10px', padding: '14px',
    fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em',
    fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
  },
};
