import React, { useState, useEffect } from 'react';
import { getVenue } from '../api/venue.api';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

export default function Venue() {
  const [venue, setVenue]   = useState(null);
  const [loading, setLoading] = useState(true);
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  useEffect(() => {
    getVenue().then(({ data }) => setVenue(data.venue)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const S = {
    page:    { minHeight: '100vh', background: '#0D0D0D', color: '#fff', paddingBottom: 80, fontFamily: "'JetBrains Mono', monospace" },
    body:    { padding: 16 },
    card:    { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, marginBottom: 12 },
    heading: { color: '#aaa', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
    chip:    { background: '#BFFF0022', color: '#BFFF00', borderRadius: 6, padding: '4px 10px', fontSize: 12, display: 'inline-block', margin: '3px' },
    row:     { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #222', fontSize: 13 },
  };

  if (loading) return <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#555' }}>Loading venue...</div></div>;

  if (!venue) return (
    <div style={S.page}>
      <TopBar title="VENUE" />
      <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Venue information not available</div>
      <BottomNav />
    </div>
  );

  const hours  = venue.operating_hours || {};
  const facils = Array.isArray(venue.facilities) ? venue.facilities : (typeof venue.facilities === 'string' ? JSON.parse(venue.facilities) : []);
  const photos = Array.isArray(venue.photos) ? venue.photos : (typeof venue.photos === 'string' ? JSON.parse(venue.photos) : []);

  return (
    <div style={S.page}>
      <TopBar title="VENUE" />
      <div style={S.body}>

        {/* Hero */}
        <div style={{ ...S.card, background: 'linear-gradient(135deg, #1a2a0a, #0D1A00)', border: '1px solid #BFFF0044', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, background: '#BFFF00', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 26, color: '#000' }}>stadium</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>{venue.name}</div>
              <div style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>{venue.city}, {venue.state}</div>
            </div>
          </div>
          {venue.description && <div style={{ color: '#ccc', fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>{venue.description}</div>}
        </div>

        {/* Contact */}
        <div style={S.card}>
          <div style={S.heading}>CONTACT</div>
          {venue.address  && <div style={S.row}><span style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: 5 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>Address</span><span style={{ textAlign: 'right', maxWidth: '55%' }}>{venue.address}</span></div>}
          {venue.phone    && <div style={S.row}><span style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: 5 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>call</span>Phone</span><span>{venue.phone}</span></div>}
          {venue.email    && <div style={S.row}><span style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: 5 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>mail</span>Email</span><span style={{ fontSize: 11 }}>{venue.email}</span></div>}
          {venue.pincode  && <div style={S.row}><span style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: 5 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>map</span>Pincode</span><span>{venue.pincode}</span></div>}
        </div>

        {/* Operating Hours */}
        {Object.keys(hours).length > 0 && (
          <div style={S.card}>
            <div style={S.heading}>OPERATING HOURS</div>
            {DAYS.map(day => {
              const h = hours[day];
              const isToday = day === today;
              return h ? (
                <div key={day} style={{ ...S.row, background: isToday ? '#BFFF0011' : 'transparent', margin: isToday ? '0 -16px' : '0', padding: isToday ? '8px 16px' : '8px 0', borderBottom: '1px solid #222' }}>
                  <span style={{ color: isToday ? '#BFFF00' : '#aaa', fontWeight: isToday ? 700 : 400, textTransform: 'capitalize' }}>
                    {isToday ? '● ' : ''}{day.slice(0,3).toUpperCase()}
                  </span>
                  <span style={{ color: isToday ? '#BFFF00' : '#fff' }}>{h.open} – {h.close}</span>
                </div>
              ) : null;
            })}
          </div>
        )}

        {/* Facilities */}
        {facils.length > 0 && (
          <div style={S.card}>
            <div style={S.heading}>FACILITIES</div>
            <div>{facils.map(f => <span key={f} style={S.chip}>{f}</span>)}</div>
          </div>
        )}

        {/* Rules */}
        {venue.rules && (
          <div style={S.card}>
            <div style={S.heading}>RULES & GUIDELINES</div>
            {venue.rules.split('.').filter(r => r.trim()).map((rule, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>
                <span style={{ color: '#BFFF00', flexShrink: 0 }}>→</span>
                <span>{rule.trim()}.</span>
              </div>
            ))}
          </div>
        )}

        {/* Maps */}
        {venue.google_maps_url && venue.google_maps_url !== 'https://maps.google.com' && (
          <a href={venue.google_maps_url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, textDecoration: 'none', color: '#fff', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#BFFF00' }}>location_on</span>
            <div style={{ fontWeight: 700, marginTop: 4 }}>OPEN IN GOOGLE MAPS</div>
          </a>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
