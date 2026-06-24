import React, { useState, useEffect } from 'react';
import { getCurrentWeather } from '../api/weather.api';

const ICON_MAP = {
  Clear: 'light_mode',
  Clouds: 'partly_cloudy_day',
  Rain: 'rainy',
  Drizzle: 'rainy_light',
  Thunderstorm: 'thunderstorm',
  Snow: 'ac_unit',
  Mist: 'foggy',
  Haze: 'foggy',
  Fog: 'foggy',
};

export default function WeatherCard() {
  const [weather, setWeather]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getCurrentWeather()
      .then(({ data: res }) => setWeather(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={S.card}>
      <div style={S.skeleton} />
    </div>
  );

  if (!weather) return null;

  const icon = ICON_MAP[weather.condition] || 'wb_cloudy';

  return (
    <div style={{ ...S.card, ...(weather.suitable_for_cricket ? S.cardGood : S.cardBad) }}>
      <div style={S.left}>
        <p style={S.label}>WEATHER — {weather.city.toUpperCase()}</p>
        <div style={S.tempRow}>
          <span className="material-symbols-outlined" style={S.icon}>{icon}</span>
          <span style={S.temp}>{weather.temp}°C</span>
        </div>
        <p style={S.desc}>{weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}</p>
        <p style={{ ...S.tip, ...(weather.suitable_for_cricket ? S.tipGood : S.tipBad) }}>
          {weather.suitable_for_cricket ? '✓' : '⚠'} {weather.tip}
        </p>
      </div>
      <div style={S.right}>
        <MetaItem label="FEELS" value={`${weather.feels_like}°`} />
        <MetaItem label="WIND" value={`${weather.wind_speed}km/h`} />
        <MetaItem label="HUMID" value={`${weather.humidity}%`} />
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#fff' }}>{value}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#555', letterSpacing: '0.1em' }}>{label}</div>
    </div>
  );
}

const S = {
  card:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161616', border: '1px solid #222', borderRadius: 12, padding: '14px 16px', fontFamily: "'Hanken Grotesk', sans-serif", marginBottom: 0 },
  cardGood: { borderColor: 'rgba(34,204,102,0.25)' },
  cardBad:  { borderColor: 'rgba(255,140,0,0.25)' },
  left:    { flex: 1 },
  label:   { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.15em', color: '#555', marginBottom: 6 },
  tempRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  icon:    { fontSize: 26, color: '#BFFF00' },
  temp:    { fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 800, color: '#fff' },
  desc:    { fontSize: 12, color: '#888', marginBottom: 4 },
  tip:     { fontSize: 11, fontWeight: 600 },
  tipGood: { color: '#22CC66' },
  tipBad:  { color: '#FF8C00' },
  right:   { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', marginLeft: 12 },
  skeleton: { height: 80, background: '#222', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' },
};
