import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSlots } from '../api/slots.api';
import { createBooking } from '../api/bookings.api';
import { formatTime, formatDateShort, getNext7Days } from '../utils/formatters';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function groupBySession(slots) {
  const morning = slots.filter((s) => parseInt(s.start_time) < 12);
  const prime   = slots.filter((s) => parseInt(s.start_time) >= 12);
  return { morning, prime };
}

export default function Booking() {
  const navigate          = useNavigate();
  const days              = getNext7Days();

  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [slots, setSlots]               = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [numPlayers, setNumPlayers]     = useState(6);
  const [step, setStep]                 = useState('select'); // 'select' | 'overview' | 'done'
  const [loading, setLoading]           = useState(false);
  const [confirming, setConfirming]     = useState(false);
  const [booking, setBooking]           = useState(null);
  const [error, setError]               = useState('');

  const loadSlots = useCallback(async (date) => {
    setLoading(true);
    setSelectedSlot(null);
    setError('');
    try {
      const { data } = await getSlots({ date, limit: 20 });
      setSlots(data.data || []);
    } catch {
      setError('Failed to load slots. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSlots(selectedDate); }, [selectedDate, loadSlots]);

  const handleDateClick = (date) => { setSelectedDate(date); };

  const handleSlotClick = (slot) => {
    if (slot.status !== 'available') return;
    setSelectedSlot(slot);
    setStep('overview');
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setConfirming(true);
    setError('');
    try {
      const { data } = await createBooking(selectedSlot.id, numPlayers);
      setBooking(data.booking);
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
      setStep('select');
    } finally {
      setConfirming(false);
    }
  };

  if (step === 'done' && booking) {
    return (
      <div style={s.page}>
        <TopBar showBack backPath="/dashboard" />
        <div style={s.doneWrap}>
          <div style={s.doneGlow} />
          <div style={s.doneIconWrap}>
            <span className="material-symbols-outlined" style={s.doneIcon}>check_circle</span>
          </div>
          <h2 style={s.doneTitle}>BOOKING CONFIRMED</h2>
          <p style={s.doneSub}>Your arena slot has been reserved.</p>
          <div style={s.doneCard}>
            <div style={s.doneRow}>
              <span style={s.doneRowLabel}>BOOKING REF</span>
              <span style={s.doneRowValue}>{booking.booking_ref}</span>
            </div>
            <div style={s.doneDivider} />
            <div style={s.doneRow}>
              <span style={s.doneRowLabel}>DATE</span>
              <span style={s.doneRowValue}>{formatDateShort(selectedSlot.slot_date)}</span>
            </div>
            <div style={s.doneRow}>
              <span style={s.doneRowLabel}>TIME</span>
              <span style={s.doneRowValue}>{formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}</span>
            </div>
            <div style={s.doneRow}>
              <span style={s.doneRowLabel}>PLAYERS</span>
              <span style={s.doneRowValue}>{numPlayers}</span>
            </div>
            <div style={s.doneRow}>
              <span style={s.doneRowLabel}>AMOUNT</span>
              <span style={{ ...s.doneRowValue, color: '#BFFF00' }}>₹{booking.total_amount}</span>
            </div>
            <div style={s.doneDivider} />
            <div style={s.doneRow}>
              <span style={s.doneRowLabel}>STATUS</span>
              <span style={s.pendingBadge}>PENDING CONFIRMATION</span>
            </div>
          </div>
          <button style={s.doneBtn} onClick={() => navigate('/my-bookings')}>
            VIEW MY BOOKINGS
          </button>
          <button style={s.doneBtnSecondary} onClick={() => { setStep('select'); setBooking(null); loadSlots(selectedDate); }}>
            BOOK ANOTHER SLOT
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (step === 'overview' && selectedSlot) {
    return (
      <div style={s.page}>
        <TopBar title="BOOKING OVERVIEW" showBack backPath="/booking" />
        <div style={s.overviewWrap}>
          <h2 style={s.overviewTitle}>CONFIRM YOUR BOOKING</h2>
          <p style={s.overviewSub}>Review your selection before confirming.</p>

          {error && <div style={s.errorBanner}>{error}</div>}

          <div style={s.overviewCard}>
            <p style={s.overviewCardTag}>SLOT DETAILS</p>
            <div style={s.overviewRow}>
              <span style={s.overviewLabel}>VENUE</span>
              <span style={s.overviewValue}>Main Arena</span>
            </div>
            <div style={s.overviewRow}>
              <span style={s.overviewLabel}>DATE</span>
              <span style={s.overviewValue}>{formatDateShort(selectedSlot.slot_date)}</span>
            </div>
            <div style={s.overviewRow}>
              <span style={s.overviewLabel}>TIME</span>
              <span style={s.overviewValue}>{formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}</span>
            </div>
            <div style={s.overviewRow}>
              <span style={s.overviewLabel}>PLAYERS</span>
              <div style={s.stepperWrap}>
                <button
                  type="button"
                  style={s.stepperBtn}
                  onClick={() => setNumPlayers((n) => Math.max(1, n - 1))}
                  disabled={numPlayers <= 1}
                >−</button>
                <span style={s.stepperVal}>{numPlayers}</span>
                <button
                  type="button"
                  style={s.stepperBtn}
                  onClick={() => setNumPlayers((n) => Math.min(22, n + 1))}
                  disabled={numPlayers >= 22}
                >+</button>
              </div>
            </div>
            <div style={s.overviewDivider} />
            <div style={s.overviewRow}>
              <span style={s.overviewLabel}>SLOT PRICE</span>
              <span style={s.overviewValue}>₹{selectedSlot.price}</span>
            </div>
            <div style={s.overviewDivider} />
            <div style={s.overviewRow}>
              <span style={{ ...s.overviewLabel, color: '#BFFF00', fontWeight: 700 }}>TOTAL</span>
              <span style={{ ...s.overviewValue, color: '#BFFF00', fontSize: '20px', fontWeight: 700 }}>₹{selectedSlot.price}</span>
            </div>
          </div>

          <button style={s.confirmBtn} onClick={handleConfirm} disabled={confirming}>
            {confirming ? 'CONFIRMING...' : 'CONFIRM BOOKING'}
            {!confirming && (
              <span className="material-symbols-outlined" style={{ fontSize: '16px', marginLeft: '8px' }}>arrow_forward</span>
            )}
          </button>

          <p style={s.secureNote}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px' }}>shield</span>
            Safe & Secure Booking
          </p>
          <button style={s.backLink} onClick={() => setStep('select')}>← Change Selection</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const { morning, prime } = groupBySession(slots);

  return (
    <div style={s.page}>
      <TopBar />

      <div style={s.header}>
        <div style={s.headerBg} />
        <div style={s.headerOverlay} />
        <p style={s.headerTag}>
          <span style={s.liveDot} /> LIVE BOOKING OPEN
        </p>
        <h1 style={s.headerTitle}>SELECT YOUR<br />BATTLEGROUND TIME</h1>
        <p style={s.headerSub}>
          Premium synthetic turf, high-intensity floodlights, and the ultimate arena for your next match.
        </p>
      </div>

      {/* Venue chip */}
      <div style={s.venueRow}>
        <div style={s.venueChip}>
          <span className="material-symbols-outlined" style={s.venueIcon}>sports_cricket</span>
          MAIN ARENA
        </div>
      </div>

      {/* Date strip */}
      <div style={s.dateStripWrap}>
        <div style={s.dateStrip}>
          {days.map((date) => {
            const d      = new Date(date + 'T00:00:00');
            const active = date === selectedDate;
            const isToday = date === days[0];
            return (
              <button
                key={date}
                style={{ ...s.dateBtn, ...(active ? s.dateBtnActive : {}) }}
                onClick={() => handleDateClick(date)}
              >
                <span style={{ ...s.dateDayName, ...(active ? s.dateDayNameActive : {}) }}>
                  {DAY_NAMES[d.getDay()]}
                </span>
                <span style={{ ...s.dateNum, ...(active ? s.dateNumActive : {}) }}>
                  {d.getDate()}
                </span>
                {isToday && <span style={s.todayLabel}>TODAY</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={s.legend}>
        <div style={s.legendItem}><span style={{ ...s.legendDot, backgroundColor: '#22CC66' }} /> AVAILABLE</div>
        <div style={s.legendItem}><span style={{ ...s.legendDot, backgroundColor: '#333' }} /> BOOKED</div>
        <div style={s.legendItem}><span style={{ ...s.legendDot, backgroundColor: '#FF8C00' }} /> HOT CHOICE</div>
      </div>

      {/* Error */}
      {error && <div style={{ ...s.errorBanner, margin: '0 16px' }}>{error}</div>}

      {/* Slot grids */}
      <div style={s.slotsWrap}>
        {loading ? (
          <div style={s.loadWrap}>
            <div style={s.loadDot} />
            <span style={s.loadText}>Loading slots...</span>
          </div>
        ) : slots.length === 0 ? (
          <div style={s.emptySlots}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#333', display: 'block', marginBottom: '12px' }}>event_busy</span>
            <p style={s.emptyText}>No slots available for this date.</p>
            <p style={{ ...s.emptyText, color: '#444', marginTop: '4px' }}>Try selecting another date.</p>
          </div>
        ) : (
          <>
            {morning.length > 0 && (
              <div style={s.sessionGroup}>
                <p style={s.sessionLabel}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>wb_sunny</span>
                  MORNING SESSION (6 AM – 12 PM)
                </p>
                <div style={s.slotGrid}>
                  {morning.map((slot) => <SlotTile key={slot.id} slot={slot} onSelect={handleSlotClick} />)}
                </div>
              </div>
            )}
            {prime.length > 0 && (
              <div style={s.sessionGroup}>
                <p style={s.sessionLabel}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>bolt</span>
                  PRIME TIME (12 PM – 10 PM)
                </p>
                <div style={s.slotGrid}>
                  {prime.map((slot) => <SlotTile key={slot.id} slot={slot} onSelect={handleSlotClick} />)}
                </div>
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

function SlotTile({ slot, onSelect }) {
  const available = slot.status === 'available';
  const isHot     = slot.price > 1000;

  return (
    <button
      style={{
        ...st.tile,
        ...(available ? st.tileAvail : st.tileBooked),
      }}
      onClick={() => onSelect(slot)}
      disabled={!available}
    >
      {isHot && available && <span style={st.hotBadge}>🔥 HOT</span>}
      {!available && (
        <div style={st.bookedOverlay}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#444' }}>block</span>
        </div>
      )}
      <span style={{ ...st.sessionType, ...(available ? {} : { color: '#333' }) }}>
        {parseInt(slot.start_time) < 12 ? 'MORNING SESSION' : 'PRIME SESSION'}
      </span>
      <span style={{ ...st.time, ...(available ? {} : { color: '#444' }) }}>
        {formatTime(slot.start_time)}
      </span>
      <span style={{ ...st.timeEnd, ...(available ? {} : { color: '#333' }) }}>
        {formatTime(slot.end_time)}
      </span>
      <span style={{ ...st.price, ...(available ? {} : { color: '#444' }) }}>
        {available ? `₹${slot.price}` : 'FULL'}
      </span>
      {available && <div style={st.availDot} />}
    </button>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#fff', fontFamily: "'Hanken Grotesk', sans-serif" },
  header: {
    padding: '28px 16px 24px',
    position: 'relative', overflow: 'hidden',
    minHeight: '300px',
  },
  headerBg: {
    position: 'absolute', inset: 0,
    backgroundImage: "url('/hero-turf.png')",
    backgroundSize: 'cover', backgroundPosition: 'center',
    zIndex: 0,
  },
  headerOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(13,13,13,0.6) 0%, rgba(13,13,13,0.95) 100%)',
    zIndex: 1,
  },
  headerTag: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.15em', color: '#BFFF00', marginBottom: '10px',
    position: 'relative', zIndex: 2,
  },
  liveDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    backgroundColor: '#BFFF00', display: 'inline-block',
  },
  headerTitle: {
    fontSize: 'clamp(26px, 8vw, 36px)', fontWeight: 800,
    lineHeight: 1.05, color: '#fff', letterSpacing: '-0.02em', marginBottom: '10px',
    position: 'relative', zIndex: 2,
  },
  headerSub: { fontSize: '13px', color: '#ccc', lineHeight: 1.5, position: 'relative', zIndex: 2 },

  venueRow: { padding: '0 16px 12px' },
  venueChip: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    backgroundColor: '#161616', border: '1px solid #2a2a2a',
    borderRadius: '8px', padding: '8px 14px',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
    letterSpacing: '0.1em', color: '#888',
  },
  venueIcon: { fontSize: '16px', color: '#BFFF00' },

  dateStripWrap: { overflowX: 'auto', padding: '0 16px 4px' },
  dateStrip: { display: 'flex', gap: '8px', paddingBottom: '4px', width: 'max-content' },
  dateBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    backgroundColor: '#161616', border: '1px solid #222',
    borderRadius: '10px', padding: '12px 14px', cursor: 'pointer', minWidth: '60px',
  },
  dateBtnActive: { backgroundColor: 'transparent', borderColor: '#BFFF00' },
  dateDayName: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.1em', color: '#555',
  },
  dateDayNameActive: { color: '#BFFF00' },
  dateNum: { fontSize: '20px', fontWeight: 700, color: '#555' },
  dateNumActive: { color: '#fff' },
  todayLabel: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '8px',
    color: '#BFFF00', letterSpacing: '0.05em',
  },

  legend: {
    display: 'flex', gap: '16px', padding: '12px 16px',
    borderBottom: '1px solid #1e1e22',
  },
  legendItem: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.08em', color: '#555',
  },
  legendDot: { width: '6px', height: '6px', borderRadius: '50%' },

  errorBanner: {
    backgroundColor: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
    borderRadius: '8px', color: '#FF4444', fontSize: '13px',
    padding: '10px 14px', marginBottom: '16px',
  },

  slotsWrap: { padding: '16px' },
  loadWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '48px 0' },
  loadDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#BFFF00' },
  loadText: { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#444', letterSpacing: '0.1em' },
  emptySlots: { textAlign: 'center', padding: '48px 0' },
  emptyText: { color: '#666', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' },

  sessionGroup: { marginBottom: '24px' },
  sessionLabel: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    letterSpacing: '0.12em', color: '#555', marginBottom: '12px',
  },
  slotGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },

  /* Overview */
  overviewWrap: { padding: '24px 16px', maxWidth: '480px', margin: '0 auto' },
  overviewTitle: { fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '6px' },
  overviewSub: { fontSize: '13px', color: '#666', marginBottom: '20px' },
  overviewCard: {
    backgroundColor: '#161616', border: '1px solid #222',
    borderRadius: '12px', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '12px',
    marginBottom: '20px',
  },
  overviewCardTag: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.2em', color: '#555', marginBottom: '4px',
  },
  overviewRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  overviewLabel: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    letterSpacing: '0.12em', color: '#666',
  },
  overviewValue: { fontSize: '14px', fontWeight: 600, color: '#fff' },
  overviewDivider: { height: '1px', backgroundColor: '#222' },
  confirmBtn: {
    width: '100%', backgroundColor: '#BFFF00', color: '#000',
    border: 'none', borderRadius: '10px', padding: '16px',
    fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em',
    fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '12px',
  },
  secureNote: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#555', fontSize: '12px', marginBottom: '16px',
  },
  backLink: {
    background: 'none', border: 'none', color: '#BFFF00',
    fontSize: '13px', cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em',
    display: 'block', width: '100%', textAlign: 'center', padding: '8px',
  },
  stepperWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
  stepperBtn: {
    width: '28px', height: '28px', borderRadius: '6px',
    backgroundColor: '#222', border: '1px solid #333',
    color: '#fff', fontSize: '16px', lineHeight: 1, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, padding: 0,
  },
  stepperVal: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '16px',
    fontWeight: 700, color: '#fff', minWidth: '22px', textAlign: 'center',
  },

  /* Done */
  doneWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '40px 16px', position: 'relative', overflow: 'hidden',
    maxWidth: '480px', margin: '0 auto',
  },
  doneGlow: {
    position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
    width: '280px', height: '200px', borderRadius: '50%',
    backgroundColor: 'rgba(191,255,0,0.07)', filter: 'blur(60px)', pointerEvents: 'none',
  },
  doneIconWrap: {
    width: '72px', height: '72px', borderRadius: '50%',
    backgroundColor: 'rgba(191,255,0,0.1)', border: '1px solid rgba(191,255,0,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '16px',
  },
  doneIcon: { fontSize: '36px', color: '#BFFF00' },
  doneTitle: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '18px',
    fontWeight: 700, color: '#fff', letterSpacing: '0.05em',
    textAlign: 'center', marginBottom: '6px',
  },
  doneSub: { fontSize: '13px', color: '#666', marginBottom: '24px', textAlign: 'center' },
  doneCard: {
    width: '100%', backgroundColor: '#161616', border: '1px solid #222',
    borderRadius: '12px', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '12px',
    marginBottom: '24px',
  },
  doneRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  doneRowLabel: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    letterSpacing: '0.12em', color: '#555',
  },
  doneRowValue: { fontSize: '14px', fontWeight: 600, color: '#fff' },
  doneDivider: { height: '1px', backgroundColor: '#222' },
  pendingBadge: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.1em', color: '#FF8C00',
    backgroundColor: 'rgba(255,140,0,0.1)', padding: '4px 10px', borderRadius: '20px',
  },
  doneBtn: {
    width: '100%', backgroundColor: '#BFFF00', color: '#000',
    border: 'none', borderRadius: '10px', padding: '16px',
    fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em',
    fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', marginBottom: '10px',
  },
  doneBtnSecondary: {
    width: '100%', backgroundColor: 'transparent', color: '#fff',
    border: '1px solid #333', borderRadius: '10px', padding: '14px',
    fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em',
    fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
  },
};

const st = {
  tile: {
    position: 'relative', borderRadius: '10px', padding: '14px 12px',
    display: 'flex', flexDirection: 'column', gap: '3px',
    textAlign: 'left', cursor: 'pointer', border: '1px solid #222',
    overflow: 'hidden', transition: 'border-color 0.15s',
  },
  tileAvail: { backgroundColor: '#161616', borderColor: '#222' },
  tileBooked: { backgroundColor: '#0f0f0f', cursor: 'not-allowed', opacity: 0.5 },
  hotBadge: {
    position: 'absolute', top: '8px', right: '8px',
    fontSize: '9px', backgroundColor: 'rgba(255,140,0,0.15)',
    color: '#FF8C00', padding: '2px 6px', borderRadius: '4px',
    fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em',
  },
  bookedOverlay: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
    padding: '10px', pointerEvents: 'none',
  },
  sessionType: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '8px',
    letterSpacing: '0.1em', color: '#555',
  },
  time: { fontSize: '16px', fontWeight: 700, color: '#fff' },
  timeEnd: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#888',
  },
  price: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
    color: '#BFFF00', fontWeight: 600, marginTop: '4px',
  },
  availDot: {
    position: 'absolute', top: '10px', right: '10px',
    width: '7px', height: '7px', borderRadius: '50%',
    backgroundColor: '#22CC66',
  },
};
