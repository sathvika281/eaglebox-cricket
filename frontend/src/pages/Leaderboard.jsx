import React, { useState, useEffect } from 'react';
import { getTopTeams, getTopPlayers, getTopRewards } from '../api/leaderboard.api';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const TABS = ['TEAMS', 'PLAYERS', 'REWARDS'];

const MEDAL_COLOR = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function Leaderboard() {
  const [tab, setTab]       = useState(0);
  const [data, setData]     = useState({ teams: null, players: null, earners: null });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    const key = ['teams', 'players', 'earners'][tab];
    if (data[key]) return;
    setLoading(true);
    setError('');
    const fetchers = [getTopTeams, getTopPlayers, getTopRewards];
    fetchers[tab]()
      .then(({ data: res }) => {
        const val = res.data.teams || res.data.players || res.data.earners || [];
        setData(d => ({ ...d, [key]: val }));
      })
      .catch(() => setError('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, [tab]);

  const rows = data[['teams', 'players', 'earners'][tab]] || [];

  return (
    <div style={S.page}>
      <TopBar title="LEADERBOARD" />

      <div style={S.hero}>
        <div style={S.heroBg} />
        <div style={S.heroOverlay} />
        <p style={S.heroTag}>RANKINGS</p>
        <h1 style={S.heroTitle}>LEADERBOARD</h1>
        <p style={S.heroSub}>Top performers at Eagle Box Cricket</p>
      </div>

      <div style={S.tabs}>
        {TABS.map((t, i) => (
          <button key={t} style={{ ...S.tab, ...(tab === i ? S.tabActive : {}) }} onClick={() => setTab(i)}>
            {t}
          </button>
        ))}
      </div>

      <div style={S.body}>
        {error && <div style={S.errorBox}>{error}</div>}

        {loading ? (
          <div style={S.loadWrap}>
            <div style={S.spinner} />
          </div>
        ) : rows.length === 0 ? (
          <div style={S.empty}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#BFFF00' }}>emoji_events</span>
            <p style={{ color: '#aaa', marginTop: 12 }}>No data yet — play more matches!</p>
          </div>
        ) : (
          <div style={S.list}>
            {rows.map((row, i) => (
              <div key={row.id} style={{ ...S.card, ...(i < 3 ? S.cardTop : {}) }}>
                <div style={S.rank}>
                  {i < 3 ? (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 900, color: MEDAL_COLOR[i] }}>{i + 1}</span>
                  ) : (
                    <span style={S.rankNum}>{i + 1}</span>
                  )}
                </div>
                <div style={S.info}>
                  {tab === 0 && <TeamRow row={row} />}
                  {tab === 1 && <PlayerRow row={row} />}
                  {tab === 2 && <RewardRow row={row} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 80 }} />
      <BottomNav />
    </div>
  );
}

function TeamRow({ row }) {
  return (
    <>
      <div style={S.name}>{row.team_name}</div>
      <div style={S.meta}>
        {row.captain_name && <span>{row.captain_name}</span>}
      </div>
      <div style={S.statRow}>
        <Stat label="W" value={row.wins} accent />
        <Stat label="M" value={row.matches_played} />
        <Stat label="L" value={row.losses} />
        <Stat label="WIN%" value={`${row.win_pct}%`} />
      </div>
    </>
  );
}

function PlayerRow({ row }) {
  return (
    <>
      <div style={S.name}>{row.name}</div>
      <div style={S.meta}>{row.email}</div>
      <div style={S.statRow}>
        <Stat label="BOOKINGS"  value={row.total_bookings} accent />
        <Stat label="TEAMS"     value={row.teams_count} />
        <Stat label="PTS"       value={row.reward_points} />
      </div>
    </>
  );
}

function RewardRow({ row }) {
  return (
    <>
      <div style={S.name}>{row.name}</div>
      <div style={S.meta}>{row.email}</div>
      <div style={S.statRow}>
        <Stat label="POINTS"   value={row.total_points} accent />
        <Stat label="LIFETIME" value={row.lifetime_points} />
      </div>
    </>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div style={S.stat}>
      <span style={{ ...S.statVal, ...(accent ? S.statValAccent : {}) }}>{value ?? 0}</span>
      <span style={S.statLabel}>{label}</span>
    </div>
  );
}

const S = {
  page:     { minHeight: '100vh', background: '#0D0D0D', color: '#fff', fontFamily: "'JetBrains Mono', monospace" },
  hero:     { position: 'relative', padding: '32px 16px 28px', overflow: 'hidden', minHeight: 140 },
  heroBg:   { position: 'absolute', inset: 0, backgroundImage: "url('/bg-5-apex-arena.png')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,13,13,0.6) 0%, rgba(13,13,13,0.95) 100%)', zIndex: 1 },
  heroTag:  { position: 'relative', zIndex: 2, fontSize: 10, letterSpacing: '0.2em', color: '#BFFF00', marginBottom: 4 },
  heroTitle: { position: 'relative', zIndex: 2, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 },
  heroSub:  { position: 'relative', zIndex: 2, fontSize: 12, color: '#aaa', marginTop: 4 },
  tabs:     { display: 'flex', borderBottom: '1px solid #222', padding: '0 16px' },
  tab:      { flex: 1, background: 'none', border: 'none', color: '#555', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', padding: '12px 0', cursor: 'pointer', borderBottom: '2px solid transparent', fontFamily: 'inherit' },
  tabActive: { color: '#BFFF00', borderBottom: '2px solid #BFFF00' },
  body:     { padding: 16 },
  list:     { display: 'flex', flexDirection: 'column', gap: 8 },
  card:     { display: 'flex', gap: 12, background: '#161616', border: '1px solid #222', borderRadius: 12, padding: '14px 16px', alignItems: 'flex-start' },
  cardTop:  { borderColor: '#333' },
  rank:     { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, flexShrink: 0, paddingTop: 2 },
  rankNum:  { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: '#444' },
  info:     { flex: 1 },
  name:     { fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 },
  meta:     { fontSize: 11, color: '#555', marginBottom: 8 },
  statRow:  { display: 'flex', gap: 16 },
  stat:     { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 },
  statVal:  { fontSize: 16, fontWeight: 700, color: '#fff' },
  statValAccent: { color: '#BFFF00' },
  statLabel: { fontSize: 9, color: '#555', letterSpacing: '0.08em' },
  loadWrap: { display: 'flex', justifyContent: 'center', padding: 48 },
  spinner:  { width: 8, height: 8, borderRadius: '50%', background: '#BFFF00' },
  empty:    { textAlign: 'center', padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  errorBox: { background: '#FF444422', border: '1px solid #FF4444', borderRadius: 8, padding: 12, color: '#FF4444', fontSize: 13, marginBottom: 12 },
};
