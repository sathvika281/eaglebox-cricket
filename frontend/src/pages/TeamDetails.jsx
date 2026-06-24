import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeam, addMember, removeMember, assignCaptain } from '../api/teams.api';
import { getPublicTeam } from '../api/leaderboard.api';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const S = {
  page:   { minHeight: '100vh', background: '#0D0D0D', color: '#fff', paddingBottom: 80, fontFamily: "'JetBrains Mono', monospace" },
  body:   { padding: 16 },
  card:   { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, marginBottom: 12 },
  btn:    (bg, col) => ({ background: bg, color: col, border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }),
  input:  { width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 10 },
  label:  { color: '#aaa', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 },
  overlay:{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal:  { background: '#1a1a1a', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, border: '1px solid #2a2a2a' },
  roleColor:   { captain: '#BFFF00', vice_captain: '#7B61FF', player: '#aaa' },
  statsRow:    { display: 'flex', gap: 10, marginBottom: 12 },
  statCard:    { flex: 1, background: '#161616', border: '1px solid #222', borderRadius: 10, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  statCardHL:  { background: 'rgba(191,255,0,0.06)', borderColor: 'rgba(191,255,0,0.2)' },
  statVal:     { fontSize: 20, fontWeight: 700, color: '#fff' },
  statValHL:   { color: '#BFFF00' },
  statLabel:   { fontSize: 8, color: '#555', letterSpacing: '0.1em' },
};

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam]     = useState(null);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]     = useState({ player_name: '', player_phone: '', role: 'player', jersey_number: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const [teamRes, statsRes] = await Promise.allSettled([getTeam(id), getPublicTeam(id)]);
      if (teamRes.status === 'fulfilled') setTeam(teamRes.value.data.team);
      else { navigate('/teams'); return; }
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data.stats);
    } finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addMember(id, { ...form, jersey_number: form.jersey_number ? Number(form.jersey_number) : undefined });
      setShowAdd(false);
      setForm({ player_name: '', player_phone: '', role: 'player', jersey_number: '' });
      fetch();
    } catch(err) { setError(err.response?.data?.message || 'Failed to add member'); }
    finally { setSaving(false); }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Remove this player?')) return;
    try { await removeMember(id, memberId); fetch(); }
    catch { setError('Failed to remove member'); }
  };

  const handleCaptain = async (memberId) => {
    try { await assignCaptain(id, memberId); fetch(); }
    catch { setError('Failed to assign captain'); }
  };

  if (loading) return <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#555' }}>Loading...</div></div>;
  if (!team) return null;

  return (
    <div style={S.page}>
      <TopBar title={team.team_name} showBack onBack={() => navigate('/teams')} />
      <div style={S.body}>
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{team.team_name}</div>
              <div style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>Captain: {team.captain_name}</div>
              {team.captain_phone && <div style={{ color: '#555', fontSize: 11 }}>{team.captain_phone}</div>}
            </div>
            <span style={{ background: '#BFFF0022', color: '#BFFF00', borderRadius: 6, padding: '4px 10px', fontSize: 12, height: 'fit-content' }}>
              {(team.members || []).length} players
            </span>
          </div>
          {team.description && <div style={{ color: '#888', fontSize: 13 }}>{team.description}</div>}
        </div>

        {stats && (
          <div style={S.statsRow}>
            {[
              { label: 'MATCHES', value: stats.matches_played },
              { label: 'WINS',    value: stats.wins,    accent: true },
              { label: 'LOSSES',  value: stats.losses },
              { label: 'WIN %',   value: `${stats.win_pct}%` },
            ].map(({ label, value, accent }) => (
              <div key={label} style={{ ...S.statCard, ...(accent ? S.statCardHL : {}) }}>
                <span style={{ ...S.statVal, ...(accent ? S.statValHL : {}) }}>{value ?? 0}</span>
                <span style={S.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {error && <div style={{ color: '#FF4444', fontSize: 13, marginBottom: 12, background: '#FF444422', padding: 10, borderRadius: 8 }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>PLAYERS ({(team.members || []).length})</div>
          <button style={S.btn('#BFFF00', '#000')} onClick={() => setShowAdd(true)}>+ ADD PLAYER</button>
        </div>

        {(team.members || []).map(m => (
          <div key={m.id} style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>{m.player_name}</span>
                {m.jersey_number && <span style={{ background: '#333', borderRadius: 4, padding: '1px 6px', fontSize: 10, color: '#aaa' }}>#{m.jersey_number}</span>}
              </div>
              <span style={{ background: (S.roleColor[m.role] || '#aaa') + '22', color: S.roleColor[m.role] || '#aaa', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                {m.role.replace('_', ' ').toUpperCase()}
              </span>
              {m.player_phone && <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>{m.player_phone}</div>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {m.role !== 'captain' && (
                <button style={S.btn('#BFFF0022', '#BFFF00')} onClick={() => handleCaptain(m.id)} title="Make captain">
                  <span className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle' }}>star</span>
                </button>
              )}
              <button style={S.btn('#FF444422', '#FF4444')} onClick={() => handleRemove(m.id)} title="Remove">
                <span className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle' }}>remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div style={S.overlay} onClick={() => setShowAdd(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>ADD PLAYER</div>
            <form onSubmit={handleAddMember}>
              <label style={S.label}>PLAYER NAME *</label>
              <input style={S.input} placeholder="Player name" value={form.player_name}
                onChange={e => setForm(f => ({ ...f, player_name: e.target.value }))} required />
              <label style={S.label}>PHONE</label>
              <input style={S.input} placeholder="+91 9999999999" value={form.player_phone}
                onChange={e => setForm(f => ({ ...f, player_phone: e.target.value }))} />
              <label style={S.label}>JERSEY NUMBER</label>
              <input style={S.input} type="number" placeholder="e.g. 7" value={form.jersey_number}
                onChange={e => setForm(f => ({ ...f, jersey_number: e.target.value }))} />
              <label style={S.label}>ROLE</label>
              <select style={{ ...S.input, appearance: 'none', marginBottom: 16 }} value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="player">Player</option>
                <option value="vice_captain">Vice Captain</option>
              </select>
              {error && <div style={{ color: '#FF4444', fontSize: 12, marginBottom: 10 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" style={{ ...S.btn('#222', '#aaa'), flex: 1 }} onClick={() => setShowAdd(false)}>CANCEL</button>
                <button type="submit" style={{ ...S.btn('#BFFF00', '#000'), flex: 1 }} disabled={saving}>{saving ? 'ADDING...' : 'ADD'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
