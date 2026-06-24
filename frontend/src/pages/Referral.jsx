import React, { useState, useEffect } from 'react';
import { getMyReferrals } from '../api/referral.api';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

export default function Referral() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getMyReferrals()
      .then(({ data: res }) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const code    = data?.referral_code || '';
  const stats   = data?.stats || { total_count: 0, completed_count: 0, pending_count: 0 };
  const list    = data?.referrals || [];
  const earned  = parseInt(stats.completed_count, 10) * 100;

  const handleCopy = async () => {
    const link = `${window.location.origin}/register?ref=${code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { setCopied(false); }
  };

  return (
    <div style={S.page}>
      <TopBar title="REFERRALS" />

      <div style={S.hero}>
        <div style={S.heroBg} />
        <div style={S.heroOverlay} />
        <p style={S.tag}>REFER & EARN</p>
        <h1 style={S.heroTitle}>INVITE FRIENDS</h1>
        <p style={S.heroSub}>Earn 100 pts for each friend who books</p>
      </div>

      {loading ? (
        <div style={S.loadWrap}><div style={S.dot} /></div>
      ) : (
        <div style={S.body}>
          {/* Referral code card */}
          <div style={S.codeCard}>
            <p style={S.codeLabel}>YOUR REFERRAL CODE</p>
            <div style={S.codeRow}>
              <span style={S.code}>{code || '—'}</span>
              {code && (
                <button style={{ ...S.copyBtn, ...(copied ? S.copyBtnDone : {}) }} onClick={handleCopy}>
                  {copied ? '✓ COPIED' : 'COPY'}
                </button>
              )}
            </div>
            <p style={{ ...S.codeSub, marginBottom: 8 }}>Share this link — your friend earns 50 pts on first booking, you earn 100 pts.</p>
            {code && <p style={{ ...S.codeSub, color: '#BFFF00', wordBreak: 'break-all' }}>{window.location.origin}/register?ref={code}</p>}
          </div>

          {/* Stats row */}
          <div style={S.statsRow}>
            {[
              { label: 'TOTAL INVITES', value: stats.total_count },
              { label: 'COMPLETED',     value: stats.completed_count, accent: true },
              { label: 'PENDING',       value: stats.pending_count },
            ].map(({ label, value, accent }) => (
              <div key={label} style={{ ...S.statCard, ...(accent ? S.statCardHL : {}) }}>
                <span style={{ ...S.statVal, ...(accent ? S.statValHL : {}) }}>{value}</span>
                <span style={S.statLabel}>{label}</span>
              </div>
            ))}
          </div>

          {earned > 0 && (
            <div style={S.earnedBanner}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#BFFF00' }}>workspace_premium</span>
              <span style={{ flex: 1 }}>You've earned <strong style={{ color: '#BFFF00' }}>{earned} pts</strong> from referrals so far</span>
            </div>
          )}

          {/* Referrals list */}
          {list.length > 0 && (
            <div style={S.section}>
              <p style={S.sectionTag}>YOUR REFERRALS</p>
              <div style={S.list}>
                {list.map(r => (
                  <div key={r.id} style={S.item}>
                    <div>
                      <div style={S.itemName}>{r.referred_name}</div>
                      <div style={S.itemEmail}>{r.referred_email}</div>
                      <div style={S.itemDate}>{new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div style={{ ...S.statusBadge, ...(r.status === 'completed' ? S.badgeDone : S.badgePending) }}>
                      {r.status === 'completed' ? '✓ COMPLETED' : 'PENDING'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {list.length === 0 && (
            <div style={S.empty}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#BFFF00' }}>handshake</span>
              <p style={S.emptyTitle}>No referrals yet</p>
              <p style={S.emptySub}>Share your code and start earning bonus points</p>
            </div>
          )}
        </div>
      )}

      <div style={{ height: 80 }} />
      <BottomNav />
    </div>
  );
}

const S = {
  page:    { minHeight: '100vh', background: '#0D0D0D', color: '#fff', fontFamily: "'JetBrains Mono', monospace" },
  hero:    { position: 'relative', padding: '32px 16px 28px', overflow: 'hidden', minHeight: 140 },
  heroBg:  { position: 'absolute', inset: 0, backgroundImage: "url('/bg-5-apex-arena.png')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,13,13,0.6) 0%, rgba(13,13,13,0.95) 100%)', zIndex: 1 },
  tag:     { position: 'relative', zIndex: 2, fontSize: 10, letterSpacing: '0.2em', color: '#BFFF00', marginBottom: 4 },
  heroTitle: { position: 'relative', zIndex: 2, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 },
  heroSub: { position: 'relative', zIndex: 2, fontSize: 12, color: '#aaa', marginTop: 4 },
  loadWrap: { display: 'flex', justifyContent: 'center', padding: 60 },
  dot:     { width: 8, height: 8, borderRadius: '50%', background: '#BFFF00' },
  body:    { padding: 16 },
  codeCard: { background: 'rgba(191,255,0,0.06)', border: '1px solid rgba(191,255,0,0.2)', borderRadius: 16, padding: 20, marginBottom: 16 },
  codeLabel: { fontSize: 10, letterSpacing: '0.2em', color: '#BFFF00', marginBottom: 10 },
  codeRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  code:    { fontSize: 28, fontWeight: 900, letterSpacing: '0.2em', color: '#BFFF00' },
  copyBtn: { background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#aaa', fontSize: 11, fontWeight: 700, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em' },
  copyBtnDone: { background: 'rgba(34,204,102,0.15)', borderColor: '#22CC66', color: '#22CC66' },
  codeSub: { fontSize: 11, color: '#555', lineHeight: 1.6 },
  statsRow: { display: 'flex', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, background: '#161616', border: '1px solid #222', borderRadius: 10, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  statCardHL: { background: 'rgba(191,255,0,0.06)', borderColor: 'rgba(191,255,0,0.2)' },
  statVal: { fontSize: 22, fontWeight: 700, color: '#fff' },
  statValHL: { color: '#BFFF00' },
  statLabel: { fontSize: 8, color: '#555', letterSpacing: '0.1em', textAlign: 'center' },
  earnedBanner: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(34,204,102,0.08)', border: '1px solid rgba(34,204,102,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#ccc', marginBottom: 16 },
  section: { marginTop: 8 },
  sectionTag: { fontSize: 9, letterSpacing: '0.2em', color: '#BFFF00', marginBottom: 12 },
  list:    { display: 'flex', flexDirection: 'column', gap: 8 },
  item:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161616', border: '1px solid #222', borderRadius: 10, padding: '14px 16px' },
  itemName:  { fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 },
  itemEmail: { fontSize: 11, color: '#555', marginBottom: 2 },
  itemDate:  { fontSize: 10, color: '#444' },
  statusBadge: { fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '5px 10px', borderRadius: 20 },
  badgeDone:    { background: 'rgba(34,204,102,0.1)', color: '#22CC66' },
  badgePending: { background: 'rgba(255,140,0,0.1)', color: '#FF8C00' },
  empty:   { textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 16 },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: '#fff' },
  emptySub:   { fontSize: 12, color: '#555', maxWidth: 220, lineHeight: 1.6 },
};
