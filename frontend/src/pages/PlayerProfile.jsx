import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicProfile } from '../api/player.api';

const RANK_COLORS = {
  'Diamond':       '#00CFFF',
  'Platinum':      '#E5E4E2',
  'Gold Player':   '#FFD700',
  'Silver Player': '#C0C0C0',
  'Bronze Player': '#CD7F32',
};

const LEVEL_ICONS = {
  'Elite Player':   'workspace_premium',
  'Pro Player':     'military_tech',
  'Regular Player': 'sports_cricket',
  'Amateur':        'sports',
  'Beginner':       'emoji_events',
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
};

export default function PlayerProfile() {
  const { cricketId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    if (!cricketId) return;
    getPublicProfile(cricketId)
      .then(({ data: res }) => setProfile(res.data))
      .catch(err => setError(err.response?.data?.message || 'Profile not found'))
      .finally(() => setLoading(false));
  }, [cricketId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  const rankColor = RANK_COLORS[profile?.rank] || '#BFFF00';
  const levelIcon = LEVEL_ICONS[profile?.level] || 'sports_cricket';

  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <button style={S.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <span style={S.headerTitle}>PLAYER PROFILE</span>
        <button style={S.shareBtn} onClick={handleShare}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>share</span>
          {copied ? 'COPIED' : 'SHARE'}
        </button>
      </header>

      <div style={S.wrap}>

        {loading && (
          <div style={S.center}><div style={S.dot} /></div>
        )}

        {error && !loading && (
          <div style={S.center}>
            <span className="material-symbols-outlined" style={{ fontSize: 52, color: '#333', marginBottom: 16 }}>person_off</span>
            <div style={{ color: '#555', fontSize: 14 }}>{error}</div>
            <button style={{ ...S.outlineBtn, marginTop: 20 }} onClick={() => navigate('/')}>GO HOME</button>
          </div>
        )}

        {profile && !loading && (
          <>
            {/* ── Profile Card ── */}
            <div style={S.card}>
              <div style={S.cardGlow} />

              <div style={S.cardTop}>
                <div style={S.brandRow}>
                  <span style={S.brand}>EAGLE BOX CRICKET</span>
                  <span style={{ ...S.rankBadge, color: rankColor, borderColor: rankColor + '55', background: rankColor + '11' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 11 }}>grade</span>
                    {profile.rank}
                  </span>
                </div>

                <div style={S.nameRow}>
                  <div style={S.avatar}>
                    <span style={S.avatarText}>
                      {profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div style={S.playerName}>{profile.name.toUpperCase()}</div>
                    <div style={S.cricketId}>{profile.cricket_id}</div>
                  </div>
                </div>

                <div style={S.metaRow}>
                  <div style={S.levelPill}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#BFFF00' }}>{levelIcon}</span>
                    {profile.level}
                  </div>
                  <div style={S.joinDate}>Member since {fmtDate(profile.joined_at)}</div>
                </div>
              </div>

              {/* Stats strip */}
              <div style={S.strip}>
                {[
                  { label: 'BOOKINGS',  value: profile.stats.total_bookings      },
                  { label: 'MATCHES',   value: profile.stats.matches_scheduled   },
                  { label: 'TEAMS',     value: profile.stats.teams_created       },
                  { label: 'POINTS',    value: profile.stats.lifetime_points     },
                  { label: 'REFERRALS', value: profile.stats.referrals_completed },
                ].map(({ label, value }, i, arr) => (
                  <React.Fragment key={label}>
                    <div style={S.stripItem}>
                      <span style={S.stripVal}>{value}</span>
                      <span style={S.stripLabel}>{label}</span>
                    </div>
                    {i < arr.length - 1 && <div style={S.stripDiv} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* ── Achievements ── */}
            {profile.achievements && profile.achievements.length > 0 && (
              <div style={S.section}>
                <p style={S.sectionTag}>ACHIEVEMENTS</p>
                <div style={S.badgeGrid}>
                  {profile.achievements.map(a => (
                    <div key={a.type} style={S.badge}>
                      <span className="material-symbols-outlined" style={{ fontSize: 24, color: a.color }}>{a.icon}</span>
                      <div style={S.badgeLabel}>{a.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Share CTA ── */}
            <div style={S.section}>
              <div style={S.shareCTA}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#BFFF00' }}>sports_cricket</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 4 }}>
                    Share this Cricket Profile
                  </div>
                  <div style={{ fontSize: 11, color: '#555', wordBreak: 'break-all' }}>
                    {window.location.href}
                  </div>
                </div>
                <button style={S.ctaBtn} onClick={handleShare}>
                  {copied ? 'COPIED!' : 'COPY'}
                </button>
              </div>
            </div>

            {/* ── Join CTA ── */}
            <div style={{ padding: '0 16px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: '#444', marginBottom: 12 }}>
                Don't have a Cricket ID yet?
              </p>
              <button style={S.joinBtn} onClick={() => navigate('/register')}>
                JOIN EAGLE BOX CRICKET
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const S = {
  page:   { minHeight: '100vh', background: '#0D0D0D', color: '#fff', fontFamily: "'JetBrains Mono', monospace" },
  wrap:   { maxWidth: 520, margin: '0 auto', paddingBottom: 32 },

  header: {
    position: 'sticky', top: 0, zIndex: 90,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', height: 56,
    background: '#0D0D0D', borderBottom: '1px solid #1e1e22',
  },
  backBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  headerTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: '#fff' },
  shareBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: 'none', border: '1px solid #333', borderRadius: 8,
    color: '#BFFF00', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
    padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit',
  },

  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, padding: 32 },
  dot:    { width: 8, height: 8, borderRadius: '50%', background: '#BFFF00' },

  /* Card */
  card: {
    margin: '16px 16px 0',
    background: 'linear-gradient(135deg, #111 0%, #0a1a00 100%)',
    border: '1px solid rgba(191,255,0,0.25)', borderRadius: 16,
    overflow: 'hidden', position: 'relative',
  },
  cardGlow: {
    position: 'absolute', top: -80, right: -80,
    width: 220, height: 220, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(191,255,0,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  cardTop:    { padding: '20px 20px 16px', position: 'relative', zIndex: 1 },
  brandRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  brand:      { fontSize: 8, letterSpacing: '0.25em', color: '#BFFF00', fontWeight: 700 },
  rankBadge:  { display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, border: '1px solid', fontSize: 9, fontWeight: 700 },
  nameRow:    { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 },
  avatar:     { width: 50, height: 50, borderRadius: '50%', background: '#BFFF00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 16, fontWeight: 900, color: '#000' },
  playerName: { fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', color: '#fff', lineHeight: 1 },
  cricketId:  { fontSize: 11, color: '#BFFF00', letterSpacing: '0.1em', marginTop: 4, fontWeight: 700 },
  metaRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  levelPill:  { display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#aaa', fontWeight: 600 },
  joinDate:   { fontSize: 9, color: '#444' },
  strip:      { display: 'flex', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(191,255,0,0.08)' },
  stripItem:  { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 4px', gap: 2 },
  stripVal:   { fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 },
  stripLabel: { fontSize: 7, color: '#555', letterSpacing: '0.1em' },
  stripDiv:   { width: 1, background: '#222', margin: '8px 0' },

  /* Sections */
  section:    { padding: '16px 16px 0' },
  sectionTag: { fontSize: 9, letterSpacing: '0.2em', color: '#BFFF00', marginBottom: 12 },

  /* Badges */
  badgeGrid:  { display: 'flex', flexWrap: 'wrap', gap: 8 },
  badge:      { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 },
  badgeLabel: { fontSize: 10, fontWeight: 700, color: '#ccc' },

  /* Share CTA */
  shareCTA: { background: '#161616', border: '1px solid #222', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' },
  ctaBtn:   { background: '#BFFF00', color: '#000', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', letterSpacing: '0.06em', flexShrink: 0 },

  /* Join */
  joinBtn: { background: '#BFFF00', color: '#000', border: 'none', borderRadius: 10, padding: '13px 28px', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit' },

  outlineBtn: { background: 'transparent', color: '#BFFF00', border: '1px solid rgba(191,255,0,0.4)', borderRadius: 8, padding: '10px 20px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em' },
};
