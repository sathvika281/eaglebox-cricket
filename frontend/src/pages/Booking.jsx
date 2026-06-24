import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSlots } from '../api/slots.api';
import { createBooking } from '../api/bookings.api';
import { createOrder, verifyPayment, notifyPaymentFailed } from '../api/payments.api';
import { validatePromo } from '../api/promos.api';
import { getRentalItems } from '../api/rentals.api';
import { formatTime, formatDateShort, getNext7Days } from '../utils/formatters';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const SORT_OPTIONS = [
  { key: 'time_asc',   label: 'TIME' },
  { key: 'price_asc',  label: '₹ LOW' },
  { key: 'price_desc', label: '₹ HIGH' },
  { key: 'popularity', label: 'POPULAR' },
];

function groupBySession(slots) {
  const morning = slots.filter((s) => parseInt(s.start_time) < 12);
  const prime   = slots.filter((s) => parseInt(s.start_time) >= 12);
  return { morning, prime };
}

export default function Booking() {
  const navigate = useNavigate();
  const days     = getNext7Days();

  // Slot selection state
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [slots, setSlots]               = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  // Filter state
  const [showFilters, setShowFilters]   = useState(false);
  const [filters, setFilters]           = useState({ sort_by: 'time_asc', time_from: '', time_to: '', price_min: '', price_max: '' });

  // Booking flow state
  const [step, setStep]         = useState('select'); // 'select' | 'overview' | 'done'
  const [numPlayers, setNumPlayers] = useState(6);
  const [confirming, setConfirming] = useState(false);
  const [booking, setBooking]   = useState(null);

  // Rental state
  const [rentalItems, setRentalItems]     = useState([]);
  const [selectedRentals, setSelectedRentals] = useState({});

  // Promo state
  const [promoInput, setPromoInput]   = useState('');
  const [promoData, setPromoData]     = useState(null);
  const [promoError, setPromoError]   = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  // Load rental items once
  useEffect(() => {
    getRentalItems().then(({ data }) => setRentalItems(data.items || [])).catch(() => {});
  }, []);

  const loadSlots = useCallback(async (date, activeFilters) => {
    setLoading(true);
    setSelectedSlot(null);
    setError('');
    const params = { date, limit: 30, ...Object.fromEntries(Object.entries(activeFilters || filters).filter(([, v]) => v !== '')) };
    try {
      const { data } = await getSlots(params);
      setSlots(data.data || []);
    } catch {
      setError('Failed to load slots. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadSlots(selectedDate); }, [selectedDate, loadSlots]);

  const applyFilters = () => { loadSlots(selectedDate, filters); setShowFilters(false); };
  const clearFilters = () => {
    const cleared = { sort_by: 'time_asc', time_from: '', time_to: '', price_min: '', price_max: '' };
    setFilters(cleared);
    loadSlots(selectedDate, cleared);
    setShowFilters(false);
  };

  const activeFilterCount = [filters.time_from, filters.time_to, filters.price_min, filters.price_max]
    .filter(Boolean).length + (filters.sort_by !== 'time_asc' ? 1 : 0);

  // Rental helpers
  const rentalTotal = Object.entries(selectedRentals).reduce((sum, [id, qty]) => {
    const item = rentalItems.find(r => r.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const rentalList = Object.entries(selectedRentals)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ rental_item_id: id, quantity: qty }));

  const adjustRental = (id, delta) => {
    setSelectedRentals(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(10, current + delta));
      if (next === 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });
  };

  // Promo helpers
  const slotPrice = selectedSlot ? parseFloat(selectedSlot.price) : 0;
  const subtotal  = slotPrice + rentalTotal;
  const discount  = promoData?.discount_amount || 0;
  const total     = Math.max(subtotal - discount, 0);

  const handleValidatePromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoData(null);
    try {
      const { data } = await validatePromo(promoInput.trim().toUpperCase(), subtotal);
      setPromoData(data);
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => { setPromoData(null); setPromoInput(''); setPromoError(''); };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setConfirming(true);
    setError('');
    try {
      const { data: bookingData } = await createBooking(
        selectedSlot.id,
        numPlayers,
        promoData?.code || null,
        rentalList
      );
      const bookingId  = bookingData.booking.id;
      const bookingRef = bookingData.booking.booking_ref;

      const loaded = await loadRazorpayScript();
      if (!loaded) { setError('Payment gateway failed to load.'); setConfirming(false); return; }

      const { data: orderData } = await createOrder(bookingId);
      const { order_id, amount, currency, key_id } = orderData.data;
      setConfirming(false);

      const options = {
        key: key_id,
        amount,
        currency,
        name: 'Eagle Box Cricket',
        description: `Slot Booking — ${bookingRef}`,
        order_id,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            navigate(`/payment-success?ref=${bookingRef}&id=${bookingId}`);
          } catch {
            navigate(`/payment-failed?ref=${bookingRef}`);
          }
        },
        theme: { color: '#BFFF00' },
        modal: {
          ondismiss: () => {
            notifyPaymentFailed(bookingId).catch(() => {});
            navigate(`/payment-failed?ref=${bookingRef}`);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
      setConfirming(false);
    }
  };

  /* ── OVERVIEW STEP ── */
  if (step === 'overview' && selectedSlot) {
    return (
      <div style={s.page}>
        <TopBar title="BOOKING OVERVIEW" showBack onBack={() => setStep('select')} />
        <div style={s.overviewWrap}>
          <h2 style={s.overviewTitle}>CONFIRM YOUR BOOKING</h2>
          <p style={s.overviewSub}>Review your selection before confirming.</p>

          {error && <div style={s.errorBanner}>{error}</div>}

          {/* Slot details */}
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
                <button type="button" style={s.stepperBtn} onClick={() => setNumPlayers(n => Math.max(1, n-1))} disabled={numPlayers <= 1}>−</button>
                <span style={s.stepperVal}>{numPlayers}</span>
                <button type="button" style={s.stepperBtn} onClick={() => setNumPlayers(n => Math.min(22, n+1))} disabled={numPlayers >= 22}>+</button>
              </div>
            </div>
          </div>

          {/* Equipment Rental */}
          {rentalItems.length > 0 && (
            <div style={s.overviewCard}>
              <p style={s.overviewCardTag}>EQUIPMENT RENTAL <span style={{ color: '#555', fontWeight: 400 }}>(optional)</span></p>
              {rentalItems.map(item => {
                const qty = selectedRentals[item.id] || 0;
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: '#555' }}>{item.description} · ₹{item.price}/item</div>
                    </div>
                    <div style={s.stepperWrap}>
                      <button type="button" style={s.stepperBtn} onClick={() => adjustRental(item.id, -1)} disabled={qty === 0}>−</button>
                      <span style={{ ...s.stepperVal, color: qty > 0 ? '#BFFF00' : '#555', minWidth: 20 }}>{qty}</span>
                      <button type="button" style={s.stepperBtn} onClick={() => adjustRental(item.id, +1)}>+</button>
                    </div>
                  </div>
                );
              })}
              {rentalTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, fontSize: 13, color: '#aaa' }}>
                  Rental total: <span style={{ color: '#fff', fontWeight: 700, marginLeft: 6 }}>₹{rentalTotal}</span>
                </div>
              )}
            </div>
          )}

          {/* Promo Code */}
          <div style={s.overviewCard}>
            <p style={s.overviewCardTag}>PROMO CODE</p>
            {promoData ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#22CC66', fontWeight: 700, fontSize: 14 }}>✓ {promoData.code}</div>
                  <div style={{ color: '#22CC66', fontSize: 12, marginTop: 2 }}>−₹{promoData.discount_amount} discount applied</div>
                  <div style={{ color: '#555', fontSize: 11, marginTop: 1 }}>{promoData.description}</div>
                </div>
                <button onClick={removePromo} style={{ background: 'transparent', border: 'none', color: '#FF4444', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>REMOVE</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={promoInput}
                    onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleValidatePromo()}
                    placeholder="Enter promo code"
                    style={{ flex: 1, background: '#111', border: '1px solid #333', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none', letterSpacing: 1 }}
                  />
                  <button onClick={handleValidatePromo} disabled={!promoInput.trim() || promoLoading}
                    style={{ background: promoInput.trim() ? '#BFFF00' : '#222', color: promoInput.trim() ? '#000' : '#555', border: 'none', borderRadius: 8, padding: '0 16px', cursor: promoInput.trim() ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
                    {promoLoading ? '...' : 'APPLY'}
                  </button>
                </div>
                {promoError && <div style={{ color: '#FF4444', fontSize: 12, marginTop: 6 }}>{promoError}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {['WELCOME50', 'CRICKET10', 'SUMMER100'].map(code => (
                    <button key={code} onClick={() => { setPromoInput(code); setPromoError(''); }}
                      style={{ background: 'transparent', border: '1px solid #333', color: '#aaa', borderRadius: 20, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {code}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Price Breakdown */}
          <div style={s.overviewCard}>
            <p style={s.overviewCardTag}>PRICE BREAKDOWN</p>
            <div style={s.overviewRow}>
              <span style={s.overviewLabel}>SLOT PRICE</span>
              <span style={s.overviewValue}>₹{slotPrice}</span>
            </div>
            {rentalTotal > 0 && (
              <div style={s.overviewRow}>
                <span style={s.overviewLabel}>EQUIPMENT RENTAL</span>
                <span style={s.overviewValue}>₹{rentalTotal}</span>
              </div>
            )}
            {discount > 0 && (
              <div style={s.overviewRow}>
                <span style={{ ...s.overviewLabel, color: '#22CC66' }}>PROMO DISCOUNT</span>
                <span style={{ ...s.overviewValue, color: '#22CC66' }}>−₹{discount}</span>
              </div>
            )}
            <div style={s.overviewDivider} />
            <div style={s.overviewRow}>
              <span style={{ ...s.overviewLabel, color: '#BFFF00', fontWeight: 700 }}>TOTAL</span>
              <span style={{ ...s.overviewValue, color: '#BFFF00', fontSize: 20, fontWeight: 700 }}>₹{total}</span>
            </div>
          </div>

          <button style={s.confirmBtn} onClick={handleConfirm} disabled={confirming}>
            {confirming ? 'CONFIRMING...' : 'CONFIRM & PAY'}
            {!confirming && <span className="material-symbols-outlined" style={{ fontSize: 16, marginLeft: 8 }}>arrow_forward</span>}
          </button>
          <p style={s.secureNote}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4 }}>shield</span>
            Safe & Secure Booking via Razorpay
          </p>
          <button style={s.backLink} onClick={() => setStep('select')}>← Change Selection</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  /* ── SLOT SELECTION STEP ── */
  const { morning, prime } = groupBySession(slots);

  return (
    <div style={s.page}>
      <TopBar />

      <div style={s.header}>
        <div style={s.headerBg} />
        <div style={s.headerOverlay} />
        <p style={s.headerTag}><span style={s.liveDot} /> LIVE BOOKING OPEN</p>
        <h1 style={s.headerTitle}>SELECT YOUR<br />BATTLEGROUND TIME</h1>
        <p style={s.headerSub}>Premium synthetic turf, high-intensity floodlights, and the ultimate arena for your next match.</p>
      </div>

      {/* Venue chip + Filter toggle */}
      <div style={{ ...s.venueRow, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={s.venueChip}>
          <span className="material-symbols-outlined" style={s.venueIcon}>sports_cricket</span>
          MAIN ARENA
        </div>
        <button onClick={() => setShowFilters(f => !f)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: showFilters ? '#BFFF00' : '#161616', border: `1px solid ${showFilters ? '#BFFF00' : '#333'}`, borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: showFilters ? '#000' : '#aaa', letterSpacing: '0.08em' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>tune</span>
          FILTER{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{ margin: '0 16px 12px', background: '#161616', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16 }}>
          {/* Sort */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: '#aaa', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 8 }}>SORT BY</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SORT_OPTIONS.map(({ key, label }) => (
                <button key={key} onClick={() => setFilters(f => ({ ...f, sort_by: key }))}
                  style={{ background: filters.sort_by === key ? '#BFFF00' : '#222', color: filters.sort_by === key ? '#000' : '#aaa', border: 'none', borderRadius: 20, padding: '5px 14px', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Time range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[['time_from', 'TIME FROM'], ['time_to', 'TIME TO']].map(([key, label]) => (
              <div key={key}>
                <div style={{ color: '#aaa', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                <input type="time" value={filters[key]}
                  onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          {/* Price range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[['price_min', 'MIN PRICE (₹)'], ['price_max', 'MAX PRICE (₹)']].map(([key, label]) => (
              <div key={key}>
                <div style={{ color: '#aaa', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                <input type="number" placeholder="Any" value={filters[key]}
                  onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={clearFilters} style={{ flex: 1, background: '#222', color: '#aaa', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>CLEAR</button>
            <button onClick={applyFilters} style={{ flex: 2, background: '#BFFF00', color: '#000', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>APPLY FILTERS</button>
          </div>
        </div>
      )}

      {/* Date strip */}
      <div style={s.dateStripWrap}>
        <div style={s.dateStrip}>
          {days.map((date) => {
            const d      = new Date(date + 'T00:00:00');
            const active = date === selectedDate;
            const isToday = date === days[0];
            return (
              <button key={date} style={{ ...s.dateBtn, ...(active ? s.dateBtnActive : {}) }} onClick={() => setSelectedDate(date)}>
                <span style={{ ...s.dateDayName, ...(active ? s.dateDayNameActive : {}) }}>{DAY_NAMES[d.getDay()]}</span>
                <span style={{ ...s.dateNum, ...(active ? s.dateNumActive : {}) }}>{d.getDate()}</span>
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

      {error && <div style={{ ...s.errorBanner, margin: '0 16px' }}>{error}</div>}

      {/* Slot grids */}
      <div style={s.slotsWrap}>
        {loading ? (
          <div style={s.loadWrap}><div style={s.loadDot} /><span style={s.loadText}>Loading slots...</span></div>
        ) : slots.length === 0 ? (
          <div style={s.emptySlots}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#333', display: 'block', marginBottom: 12 }}>event_busy</span>
            <p style={s.emptyText}>No slots found for this date{activeFilterCount > 0 ? ' with current filters' : ''}.</p>
            {activeFilterCount > 0 && <button onClick={clearFilters} style={{ marginTop: 12, background: '#BFFF00', color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>CLEAR FILTERS</button>}
          </div>
        ) : (
          <>
            {morning.length > 0 && (
              <div style={s.sessionGroup}>
                <p style={s.sessionLabel}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>wb_sunny</span> MORNING SESSION (6 AM – 12 PM)</p>
                <div style={s.slotGrid}>{morning.map((slot) => <SlotTile key={slot.id} slot={slot} onSelect={s => { setSelectedSlot(s); setStep('overview'); }} />)}</div>
              </div>
            )}
            {prime.length > 0 && (
              <div style={s.sessionGroup}>
                <p style={s.sessionLabel}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>bolt</span> PRIME TIME (12 PM – 10 PM)</p>
                <div style={s.slotGrid}>{prime.map((slot) => <SlotTile key={slot.id} slot={slot} onSelect={s => { setSelectedSlot(s); setStep('overview'); }} />)}</div>
              </div>
            )}
          </>
        )}
      </div>
      <div style={{ height: 80 }} />
      <BottomNav />
    </div>
  );
}

function SlotTile({ slot, onSelect }) {
  const available = slot.status === 'available';
  const isHot     = slot.price > 1000;
  return (
    <button style={{ ...st.tile, ...(available ? st.tileAvail : st.tileBooked) }} onClick={() => onSelect(slot)} disabled={!available}>
      {isHot && available && <span style={{ ...st.hotBadge, display: 'inline-flex', alignItems: 'center', gap: 2 }}><span className="material-symbols-outlined" style={{ fontSize: 11 }}>local_fire_department</span>HOT</span>}
      {!available && <div style={st.bookedOverlay}><span className="material-symbols-outlined" style={{ fontSize: 18, color: '#444' }}>block</span></div>}
      <span style={{ ...st.sessionType, ...(available ? {} : { color: '#333' }) }}>{parseInt(slot.start_time) < 12 ? 'MORNING' : 'PRIME'}</span>
      <span style={{ ...st.time,      ...(available ? {} : { color: '#444' }) }}>{formatTime(slot.start_time)}</span>
      <span style={{ ...st.timeEnd,   ...(available ? {} : { color: '#333' }) }}>{formatTime(slot.end_time)}</span>
      <span style={{ ...st.price,     ...(available ? {} : { color: '#444' }) }}>{available ? `₹${slot.price}` : 'FULL'}</span>
      {available && <div style={st.availDot} />}
    </button>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#fff', fontFamily: "'Hanken Grotesk', sans-serif" },
  header: { padding: '28px 16px 24px', position: 'relative', overflow: 'hidden', minHeight: 300 },
  headerBg: { position: 'absolute', inset: 0, backgroundImage: "url('/hero-turf.png')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 },
  headerOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,13,13,0.6) 0%, rgba(13,13,13,0.95) 100%)', zIndex: 1 },
  headerTag: { display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.15em', color: '#BFFF00', marginBottom: 10, position: 'relative', zIndex: 2 },
  liveDot: { width: 6, height: 6, borderRadius: '50%', backgroundColor: '#BFFF00', display: 'inline-block' },
  headerTitle: { fontSize: 'clamp(26px,8vw,36px)', fontWeight: 800, lineHeight: 1.05, color: '#fff', letterSpacing: '-0.02em', marginBottom: 10, position: 'relative', zIndex: 2 },
  headerSub: { fontSize: 13, color: '#ccc', lineHeight: 1.5, position: 'relative', zIndex: 2 },
  venueRow: { padding: '0 16px 12px' },
  venueChip: { display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#161616', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.1em', color: '#888' },
  venueIcon: { fontSize: 16, color: '#BFFF00' },
  dateStripWrap: { overflowX: 'auto', padding: '0 16px 4px' },
  dateStrip: { display: 'flex', gap: 8, paddingBottom: 4, width: 'max-content' },
  dateBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, backgroundColor: '#161616', border: '1px solid #222', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', minWidth: 60 },
  dateBtnActive: { backgroundColor: 'transparent', borderColor: '#BFFF00' },
  dateDayName: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.1em', color: '#555' },
  dateDayNameActive: { color: '#BFFF00' },
  dateNum: { fontSize: 20, fontWeight: 700, color: '#555' },
  dateNumActive: { color: '#fff' },
  todayLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#BFFF00', letterSpacing: '0.05em' },
  legend: { display: 'flex', gap: 16, padding: '12px 16px', borderBottom: '1px solid #1e1e22' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.08em', color: '#555' },
  legendDot: { width: 6, height: 6, borderRadius: '50%' },
  errorBanner: { backgroundColor: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 8, color: '#FF4444', fontSize: 13, padding: '10px 14px', marginBottom: 16 },
  slotsWrap: { padding: 16 },
  loadWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 0' },
  loadDot: { width: 10, height: 10, borderRadius: '50%', backgroundColor: '#BFFF00' },
  loadText: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#444', letterSpacing: '0.1em' },
  emptySlots: { textAlign: 'center', padding: '48px 0' },
  emptyText: { color: '#666', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 },
  sessionGroup: { marginBottom: 24 },
  sessionLabel: { display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: '#555', marginBottom: 12 },
  slotGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  overviewWrap: { padding: '24px 16px', maxWidth: 480, margin: '0 auto' },
  overviewTitle: { fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 },
  overviewSub: { fontSize: 13, color: '#666', marginBottom: 20 },
  overviewCard: { backgroundColor: '#161616', border: '1px solid #222', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 },
  overviewCardTag: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.2em', color: '#555', marginBottom: 4 },
  overviewRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  overviewLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: '#666' },
  overviewValue: { fontSize: 14, fontWeight: 600, color: '#fff' },
  overviewDivider: { height: 1, backgroundColor: '#222' },
  confirmBtn: { width: '100%', backgroundColor: '#BFFF00', color: '#000', border: 'none', borderRadius: 10, padding: 16, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  secureNote: { display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 12, marginBottom: 16 },
  backLink: { background: 'none', border: 'none', color: '#BFFF00', fontSize: 13, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', display: 'block', width: '100%', textAlign: 'center', padding: 8 },
  stepperWrap: { display: 'flex', alignItems: 'center', gap: 12 },
  stepperBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#222', border: '1px solid #333', color: '#fff', fontSize: 16, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, padding: 0 },
  stepperVal: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: '#fff', minWidth: 22, textAlign: 'center' },
};

const st = {
  tile: { position: 'relative', borderRadius: 10, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'left', cursor: 'pointer', border: '1px solid #222', overflow: 'hidden' },
  tileAvail: { backgroundColor: '#161616', borderColor: '#222' },
  tileBooked: { backgroundColor: '#0f0f0f', cursor: 'not-allowed', opacity: 0.5 },
  hotBadge: { position: 'absolute', top: 8, right: 8, fontSize: 9, backgroundColor: 'rgba(255,140,0,0.15)', color: '#FF8C00', padding: '2px 6px', borderRadius: 4, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' },
  bookedOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: 10, pointerEvents: 'none' },
  sessionType: { fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '0.1em', color: '#555' },
  time: { fontSize: 16, fontWeight: 700, color: '#fff' },
  timeEnd: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#888' },
  price: { fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#BFFF00', fontWeight: 600, marginTop: 4 },
  availDot: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22CC66' },
};
