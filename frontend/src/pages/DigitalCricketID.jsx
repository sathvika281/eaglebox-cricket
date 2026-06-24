import React, { useState, useEffect } from 'react';
import { getMyProfile, getMyQRCode, updateMyProfile } from '../api/player.api';
import TopBar   from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

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

const ACHIEVEMENT_ICON_STYLE = (unlocked, color) => ({
  fontSize: 22,
  color: unlocked ? color : '#333',
});

const ACTIVITY_META = {
  booking_created:    { icon: 'receipt_long',  color: '#BFFF00' },
  payment_completed:  { icon: 'payments',      color: '#22CC66' },
  team_created:       { icon: 'groups',        color: '#FFD700' },
  team_joined:        { icon: 'group_add',     color: '#7B61FF' },
  match_scheduled:    { icon: 'sports_cricket',color: '#BFFF00' },
  referral_completed: { icon: 'handshake',     color: '#FF6B35' },
  achievement_earned: { icon: 'emoji_events',  color: '#FFD700' },
};

const ACHIEVEMENT_LABELS = {
  first_booking:     'First Booking',
  first_payment:     'First Payment',
  team_captain:      'Team Captain',
  matches_5:         '5 Matches',
  matches_10:        '10 Matches',
  points_50:         '50 Points',
  points_100:        '100 Points',
  referral_champion: 'Referral Champion',
  early_adopter:     'Early Adopter',
  match_organizer:   'Match Organizer',
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtRelative = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)   return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)    return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)   return `${days}d ago`;
  return fmtDate(iso);
};

const formatActivityDesc = (row) => {
  if (row.activity_type === 'achievement_earned') {
    return `Unlocked: ${ACHIEVEMENT_LABELS[row.description] || row.description}`;
  }
  return row.description;
};

export default function DigitalCricketID() {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showQR, setShowQR]     = useState(false);
  const [qrData, setQrData]     = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [editBio, setEditBio]   = useState(false);
  const [bio, setBio]           = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'achievements' | 'timeline'

  useEffect(() => {
    getMyProfile()
      .then(({ data: res }) => {
        setProfile(res.data);
        setBio(res.data.bio || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleShowQR = async () => {
    if (!qrData) {
      setQrLoading(true);
      try {
        const { data: res } = await getMyQRCode();
        setQrData(res.data);
      } catch { } finally { setQrLoading(false); }
    }
    setShowQR(true);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/player/${profile.cricket_id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      await updateMyProfile({ bio });
      setProfile(p => ({ ...p, bio }));
      setEditBio(false);
    } catch { } finally { setSavingBio(false); }
  };

  if (loading) return (
    <div style={S.page}>
      <TopBar title="CRICKET ID" />
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#BFFF00' }} />
      </div>
      <BottomNav />
    </div>
  );

  if (!profile) return (
    <div style={S.page}>
      <TopBar title="CRICKET ID" />
      <div style={{ textAlign: 'center', padding: 60, color: '#555' }}>Failed to load your Cricket ID</div>
      <BottomNav />
    </div>
  );

  const rankColor = RANK_COLORS[profile.rank] || '#BFFF00';
  const levelIcon = LEVEL_ICONS[profile.level] || 'sports_cricket';
  const unlockedCount = (profile.achievements || []).filter(a => a.unlocked).length;
  const totalAchievements = (profile.achievements || []).length;

  return (
    <div style={S.page}>
      <TopBar title="CRICKET ID" />

      <div style={S.wrap}>

        {/* ── ID Card ── */}
        <div style={S.card}>
          <div style={S.cardGlow} />
          <div style={S.cardInner}>

            {/* Header row */}
            <div style={S.cardHeader}>
              <div>
                <div style={S.cardBrand}>EAGLE BOX CRICKET</div>
                <div style={S.cardIdLabel}>DIGITAL CRICKET ID</div>
              </div>
              <div style={{ ...S.rankBadge, color: rankColor, borderColor: rankColor + '55', background: rankColor + '11' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>grade</span>
                {profile.rank}
              </div>
            </div>

            {/* Avatar + Name */}
            <div style={S.cardNameRow}>
              <div style={S.avatar}>
                <span style={S.avatarText}>{(profile.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}</span>
              </div>
              <div>
                <div style={S.playerName}>{profile.name.toUpperCase()}</div>
                <div style={S.cricketId}>{profile.cricket_id}</div>
              </div>
            </div>

            {/* Stats strip */}
            <div style={S.cardStrip}>
              <div style={S.stripItem}>
                <span style={S.stripVal}>{profile.stats.total_points}</span>
                <span style={S.stripLabel}>POINTS</span>
              </div>
              <div style={S.stripDivider} />
              <div style={S.stripItem}>
                <span style={S.stripVal}>{profile.stats.total_bookings}</span>
                <span style={S.stripLabel}>BOOKINGS</span>
              </div>
              <div style={S.stripDivider} />
              <div style={S.stripItem}>
                <span style={S.stripVal}>{profile.stats.matches_scheduled}</span>
                <span style={S.stripLabel}>MATCHES</span>
              </div>
            </div>

            {/* Level + Join date */}
            <div style={S.cardMeta}>
              <div style={S.levelTag}>
                <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#BFFF00' }}>{levelIcon}</span>
                {profile.level}
              </div>
              <div style={S.joinDate}>Since {fmtDate(profile.joined_at)}</div>
            </div>

            {/* Action buttons */}
            <div style={S.cardActions}>
              <button style={S.actionBtn} onClick={handleShowQR} disabled={qrLoading}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>qr_code_2</span>
                {qrLoading ? 'LOADING...' : 'MY QR CODE'}
              </button>
              <button style={{ ...S.actionBtn, ...S.actionBtnOutline }} onClick={handleCopyLink}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>share</span>
                {copied ? 'COPIED!' : 'SHARE PROFILE'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Bio ── */}
        <div style={S.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={S.sectionTag}>BIO</p>
            <button style={S.editBtn} onClick={() => editBio ? handleSaveBio() : setEditBio(true)}>
              {editBio ? (savingBio ? 'SAVING...' : 'SAVE') : 'EDIT'}
            </button>
          </div>
          {editBio ? (
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={200}
              placeholder="Tell the cricket world about yourself..."
              style={S.bioInput}
            />
          ) : (
            <p style={S.bioText}>{profile.bio || 'No bio yet. Tap EDIT to add one.'}</p>
          )}
        </div>

        {/* ── Tab bar ── */}
        <div style={S.tabBar}>
          {[
            { id: 'stats',        label: 'STATS'        },
            { id: 'achievements', label: `BADGES (${unlockedCount}/${totalAchievements})` },
            { id: 'timeline',     label: 'ACTIVITY'     },
          ].map(t => (
            <button key={t.id}
              style={{ ...S.tabBtn, ...(activeTab === t.id ? S.tabBtnActive : {}) }}
              onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Stats ── */}
        {activeTab === 'stats' && (
          <div style={S.section}>
            <div style={S.statsGrid}>
              {[
                { label: 'TOTAL BOOKINGS',     value: profile.stats.total_bookings,      icon: 'receipt_long'   },
                { label: 'MATCHES SCHEDULED',  value: profile.stats.matches_scheduled,   icon: 'sports_cricket' },
                { label: 'MATCHES PLAYED',     value: profile.stats.matches_completed,   icon: 'emoji_events'   },
                { label: 'TEAMS CREATED',      value: profile.stats.teams_created,       icon: 'groups'         },
                { label: 'TEAMS JOINED',       value: profile.stats.teams_joined,        icon: 'group_add'      },
                { label: 'LIFETIME POINTS',    value: profile.stats.lifetime_points,     icon: 'workspace_premium', accent: true },
                { label: 'CURRENT POINTS',     value: profile.stats.total_points,        icon: 'star',          accent: true },
                { label: 'REFERRALS DONE',     value: profile.stats.referrals_completed, icon: 'handshake'      },
              ].map(({ label, value, icon, accent }) => (
                <div key={label} style={{ ...S.statCard, ...(accent ? S.statCardHL : {}) }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: accent ? '#BFFF00' : '#444', marginBottom: 4 }}>{icon}</span>
                  <span style={{ ...S.statVal, ...(accent ? { color: '#BFFF00' } : {}) }}>{value}</span>
                  <span style={S.statLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Achievements ── */}
        {activeTab === 'achievements' && (
          <div style={S.section}>
            <div style={S.badgeGrid}>
              {(profile.achievements || []).map(a => (
                <div key={a.type} style={{ ...S.badge, ...(a.unlocked ? S.badgeUnlocked : S.badgeLocked) }}>
                  <span className="material-symbols-outlined" style={ACHIEVEMENT_ICON_STYLE(a.unlocked, a.color)}>
                    {a.icon}
                  </span>
                  <div style={{ ...S.badgeLabel, ...(a.unlocked ? { color: '#fff' } : {}) }}>{a.label}</div>
                  {a.unlocked ? (
                    <div style={S.badgeDate}>{fmtDate(a.earned_at)}</div>
                  ) : (
                    <div style={{ ...S.badgeDate, color: '#333' }}>{a.description}</div>
                  )}
                  {a.unlocked && <div style={{ ...S.badgeDot, background: a.color }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Activity Timeline ── */}
        {activeTab === 'timeline' && (
          <div style={S.section}>
            {(!profile.timeline || profile.timeline.length === 0) ? (
              <div style={S.empty}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#333', marginBottom: 8 }}>history</span>
                <p style={{ color: '#555', fontSize: 13 }}>No activity yet. Book a slot, create a team, or schedule a match!</p>
              </div>
            ) : (
              <div style={S.timeline}>
                {profile.timeline.map((row, i) => {
                  const meta = ACTIVITY_META[row.activity_type] || { icon: 'circle', color: '#555' };
                  return (
                    <div key={row.entity_id + i} style={S.timelineRow}>
                      <div style={{ ...S.timelineDot, background: meta.color + '22', border: `1px solid ${meta.color}44` }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: meta.color }}>{meta.icon}</span>
                      </div>
                      <div style={S.timelineContent}>
                        <div style={S.timelineDesc}>{formatActivityDesc(row)}</div>
                        <div style={S.timelineTime}>{fmtRelative(row.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>

      {/* ── QR Modal ── */}
      {showQR && (
        <div style={S.overlay} onClick={() => setShowQR(false)}>
          <div style={S.qrModal} onClick={e => e.stopPropagation()}>
            <div style={S.qrTitle}>YOUR CRICKET QR</div>
            <p style={S.qrSub}>Scan to view your public cricket profile</p>
            {qrData?.qr && (
              <div style={S.qrWrap}>
                <img src={qrData.qr} alt="Profile QR code" style={{ width: 220, height: 220, borderRadius: 12 }} />
              </div>
            )}
            <div style={S.qrId}>{profile.cricket_id}</div>
            <p style={S.qrUrl}>{qrData?.url}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button style={{ ...S.actionBtn, flex: 1 }} onClick={handleCopyLink}>
                {copied ? 'COPIED!' : 'COPY LINK'}
              </button>
              <button style={{ ...S.actionBtn, ...S.actionBtnOutline, flex: 1 }} onClick={() => setShowQR(false)}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', background: '#0D0D0D', color: '#fff', fontFamily: "'JetBrains Mono', monospace" },
  wrap: { maxWidth: 600, margin: '0 auto', padding: '0 0 16px' },

  /* ID Card */
  card: {
    margin: '16px 16px 0',
    background: 'linear-gradient(135deg, #111 0%, #0a1a00 100%)',
    border: '1px solid rgba(191,255,0,0.3)',
    borderRadius: 16, overflow: 'hidden', position: 'relative',
  },
  cardGlow: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(191,255,0,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  cardInner:  { padding: '20px 20px 18px', position: 'relative', zIndex: 1 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  cardBrand:  { fontSize: 9, letterSpacing: '0.25em', color: '#BFFF00', fontWeight: 700 },
  cardIdLabel:{ fontSize: 8, letterSpacing: '0.15em', color: '#555', marginTop: 2 },
  rankBadge:  {
    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
    borderRadius: 20, border: '1px solid', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
  },
  cardNameRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 },
  avatar: {
    width: 52, height: 52, borderRadius: '50%', background: '#BFFF00',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText:  { fontSize: 18, fontWeight: 900, color: '#000' },
  playerName:  { fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', color: '#fff', lineHeight: 1 },
  cricketId:   { fontSize: 12, color: '#BFFF00', letterSpacing: '0.1em', marginTop: 4, fontWeight: 700 },

  cardStrip:   { display: 'flex', gap: 0, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 0', marginBottom: 14 },
  stripItem:   { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  stripVal:    { fontSize: 22, fontWeight: 800, color: '#fff' },
  stripLabel:  { fontSize: 8, color: '#555', letterSpacing: '0.12em' },
  stripDivider:{ width: 1, background: '#222', margin: '0 4px' },

  cardMeta:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  levelTag:  { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#aaa', fontWeight: 600 },
  joinDate:  { fontSize: 10, color: '#444' },

  cardActions: { display: 'flex', gap: 10 },
  actionBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    background: '#BFFF00', color: '#000', border: 'none', borderRadius: 8,
    padding: '10px 12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  actionBtnOutline: {
    background: 'transparent', color: '#BFFF00', border: '1px solid rgba(191,255,0,0.4)',
  },

  /* Bio */
  section:   { padding: '16px 16px 0' },
  sectionTag: { fontSize: 9, letterSpacing: '0.2em', color: '#BFFF00', margin: 0 },
  editBtn:   { background: 'none', border: '1px solid #333', borderRadius: 6, color: '#BFFF00', fontSize: 10, fontWeight: 700, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.06em' },
  bioText:   { fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 },
  bioInput:  { width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, fontFamily: 'inherit', resize: 'none', minHeight: 80, boxSizing: 'border-box' },

  /* Tabs */
  tabBar: { display: 'flex', borderBottom: '1px solid #1e1e22', margin: '16px 16px 0', gap: 0 },
  tabBtn: {
    flex: 1, background: 'none', border: 'none', color: '#555', fontSize: 9,
    fontWeight: 700, letterSpacing: '0.08em', padding: '11px 4px',
    cursor: 'pointer', borderBottom: '2px solid transparent', fontFamily: 'inherit',
  },
  tabBtnActive: { color: '#BFFF00', borderBottom: '2px solid #BFFF00' },

  /* Stats */
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 },
  statCard:  { background: '#161616', border: '1px solid #222', borderRadius: 10, padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statCardHL:{ background: 'rgba(191,255,0,0.06)', borderColor: 'rgba(191,255,0,0.2)' },
  statVal:   { fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 },
  statLabel: { fontSize: 8, color: '#555', letterSpacing: '0.1em', textAlign: 'center', marginTop: 2 },

  /* Achievements */
  badgeGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 },
  badge:        { borderRadius: 12, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', textAlign: 'center' },
  badgeUnlocked:{ background: '#1a1a1a', border: '1px solid #2a2a2a' },
  badgeLocked:  { background: '#111', border: '1px solid #1a1a1a', opacity: 0.6 },
  badgeLabel:   { fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color: '#555', lineHeight: 1.2 },
  badgeDate:    { fontSize: 8, color: '#444', lineHeight: 1.3 },
  badgeDot:     { position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%' },

  /* Timeline */
  timeline:    { display: 'flex', flexDirection: 'column', gap: 0, marginTop: 14 },
  timelineRow: { display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 16 },
  timelineDot: { width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  timelineContent: { flex: 1, borderBottom: '1px solid #1a1a1a', paddingBottom: 16 },
  timelineDesc: { fontSize: 12, color: '#ccc', lineHeight: 1.4 },
  timelineTime: { fontSize: 10, color: '#444', marginTop: 4 },

  empty: { textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' },

  /* QR Modal */
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  qrModal: { background: '#161616', border: '1px solid #2a2a2a', borderRadius: 20, padding: 28, width: '100%', maxWidth: 320, textAlign: 'center' },
  qrTitle: { fontSize: 14, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 6 },
  qrSub:   { fontSize: 11, color: '#666', marginBottom: 16 },
  qrWrap:  { display: 'flex', justifyContent: 'center', marginBottom: 16, padding: 12, background: '#fff', borderRadius: 12 },
  qrId:    { fontSize: 14, fontWeight: 700, color: '#BFFF00', letterSpacing: '0.1em', marginBottom: 6 },
  qrUrl:   { fontSize: 9, color: '#444', wordBreak: 'break-all', marginBottom: 4 },
};
