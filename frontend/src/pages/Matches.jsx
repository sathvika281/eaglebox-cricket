import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getMyMatches, scheduleMatch, cancelMatch } from '../api/matches.api';
import { getMyTeams } from '../api/teams.api';
import { getMatchPhotos, addMatchPhoto, deletePhoto, uploadPhoto } from '../api/gallery.api';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const STATUS = {
  scheduled: { color: '#BFFF00', label: 'SCHEDULED' },
  completed:  { color: '#22CC66', label: 'COMPLETED' },
  cancelled:  { color: '#FF4444', label: 'CANCELLED' },
};

function MatchGallery({ matchId }) {
  const [photos, setPhotos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState('');
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [adding, setAdding]   = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    getMatchPhotos(matchId)
      .then(({ data: res }) => setPhotos(res.data.photos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [matchId]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!file) return;
    setAdding(true);
    try {
      const { data: up } = await uploadPhoto(file);
      const { data: res } = await addMatchPhoto(matchId, { photo_url: up.url, caption: caption.trim() || undefined });
      setPhotos(prev => [res.data.photo, ...prev]);
      setFile(null); setPreview(null); setCaption('');
    } catch { } finally { setAdding(false); }
  };

  const handleDelete = async (photoId) => {
    try {
      await deletePhoto(matchId, photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch { }
  };

  return (
    <div style={{ borderTop: '1px solid #2a2a2a', marginTop: 12, paddingTop: 12 }}>
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {/* label wraps input — works on both mobile (camera/gallery sheet) and desktop (file explorer) */}
        <label style={{ cursor: 'pointer' }}>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          {preview
            ? <div style={{ position: 'relative' }}>
                <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8 }} />
                <span style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: 4, padding: '3px 7px', fontSize: 11 }}>✕ Change</span>
              </div>
            : <div style={{ border: '2px dashed #333', borderRadius: 8, padding: '16px', textAlign: 'center', background: '#111' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#BFFF00' }}>add_photo_alternate</span>
                <p style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Tap to take photo or choose from gallery</p>
              </div>
          }
        </label>
        <input style={{ ...S.input, marginBottom: 0 }} placeholder="Caption (optional)" value={caption} onChange={e => setCaption(e.target.value)} />
        <button type="submit" style={{ ...S.btn('#BFFF00', '#000'), alignSelf: 'flex-start', fontSize: 11, padding: '8px 16px' }} disabled={adding || !file}>
          {adding ? 'UPLOADING...' : '+ UPLOAD'}
        </button>
      </form>

      {loading ? (
        <div style={{ color: '#555', fontSize: 12 }}>Loading photos...</div>
      ) : photos.length === 0 ? (
        <div style={{ color: '#555', fontSize: 12 }}>No photos yet. Add the first one!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {photos.map(p => (
            <div key={p.id} style={{ position: 'relative' }}>
              <img
                src={p.photo_url}
                alt={p.caption || 'match photo'}
                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 8, background: '#111' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              {p.caption && <div style={{ fontSize: 9, color: '#888', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.caption}</div>}
              <button
                onClick={() => handleDelete(p.id)}
                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 4, color: '#FF4444', fontSize: 10, padding: '2px 6px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const S = {
  page:    { minHeight: '100vh', background: '#0D0D0D', color: '#fff', paddingBottom: 80, fontFamily: "'JetBrains Mono', monospace" },
  body:    { padding: 16 },
  card:    { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, marginBottom: 12 },
  btn:     (bg, col) => ({ background: bg, color: col, border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }),
  input:   { width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 12 },
  label:   { color: '#aaa', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal:   { background: '#1a1a1a', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, border: '1px solid #2a2a2a', maxHeight: '90vh', overflowY: 'auto' },
};

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [form, setForm] = useState({ team_a_id: '', team_b_id: '', opponent_name: '', match_date: '', match_time: '', venue_note: '' });
  const [opponentMode, setOpponentMode] = useState('external'); // 'myteam' | 'external'
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [galleryOpen, setGalleryOpen] = useState(null); // matchId

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [mRes, tRes] = await Promise.all([getMyMatches(), getMyTeams()]);
      setMatches(mRes.data.matches || []);
      setTeams(tRes.data.teams || []);
    } catch { setError('Failed to load matches'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        team_a_id:  form.team_a_id,
        match_date: form.match_date,
        match_time: form.match_time,
        ...(form.venue_note ? { venue_note: form.venue_note } : {}),
        ...(opponentMode === 'myteam'
          ? { team_b_id: form.team_b_id }
          : { opponent_name: form.opponent_name }),
      };
      const token = localStorage.getItem('ebc_access_token');
      const res = await fetch('/api/v1/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.errors?.join(', ') || json.message || `Error ${res.status}`); return; }
      setShowSchedule(false);
      setForm({ team_a_id: '', team_b_id: '', opponent_name: '', match_date: '', match_time: '', venue_note: '' });
      setOpponentMode('external');
      fetchAll();
    } catch(err) {
      setError(err.message || 'Network error — is the API server running?');
    }
    finally { setSaving(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this match?')) return;
    try { await cancelMatch(id); fetchAll(); }
    catch(err) { setError(err.response?.data?.message || 'Failed to cancel match'); }
  };

  return (
    <div style={S.page}>
      <TopBar title="MY MATCHES" />
      <div style={S.body}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: '#aaa', fontSize: 12 }}>{matches.length} match{matches.length !== 1 ? 'es' : ''}</div>
          <button style={S.btn('#BFFF00', '#000')} onClick={() => { setShowSchedule(true); setError(''); }}>+ SCHEDULE</button>
        </div>

        {error && <div style={{ background: '#FF444422', border: '1px solid #FF4444', borderRadius: 8, padding: 12, color: '#FF4444', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', color: '#555', padding: 40 }}>Loading matches...</div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 52, color: '#BFFF00', display: 'block', marginBottom: 12 }}>sports_cricket</span>
            <div style={{ color: '#aaa', marginBottom: 16 }}>No matches yet. Schedule a friendly match!</div>
          </div>
        ) : (
          matches.map(m => {
            const st = STATUS[m.status] || STATUS.scheduled;
            return (
              <div key={m.id} style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ background: st.color + '22', color: st.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                  <span style={{ color: '#555', fontSize: 11 }}>{new Date(m.match_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{m.team_a_name}</div>
                    <div style={{ color: '#555', fontSize: 11 }}>{m.team_a_captain}</div>
                  </div>
                  <div style={{ padding: '0 12px', color: '#BFFF00', fontWeight: 900, fontSize: 18 }}>VS</div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{m.team_b_name}</div>
                    <div style={{ color: '#555', fontSize: 11 }}>{m.team_b_captain}</div>
                  </div>
                </div>
                <div style={{ color: '#aaa', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#555' }}>schedule</span>
                  {m.match_time?.slice(0, 5)} {m.venue_note && `· ${m.venue_note}`}
                </div>
                {m.result && <div style={{ color: '#22CC66', fontSize: 12, marginTop: 6 }}>Result: {m.result}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button style={{ ...S.btn('#1a1a1a', '#BFFF00'), padding: '6px 14px', fontSize: 12, border: '1px solid #333', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => setGalleryOpen(galleryOpen === m.id ? null : m.id)}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>photo_library</span>GALLERY
                  </button>
                  {m.status === 'scheduled' && (
                    <button style={{ ...S.btn('#FF444422', '#FF4444'), padding: '6px 14px', fontSize: 12 }} onClick={() => handleCancel(m.id)}>CANCEL</button>
                  )}
                </div>
                {galleryOpen === m.id && <MatchGallery matchId={m.id} />}
              </div>
            );
          })
        )}
      </div>

      {showSchedule && (
        <div style={S.overlay} onClick={() => setShowSchedule(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>SCHEDULE MATCH</div>
            {teams.length === 0 ? (
              <div style={{ color: '#aaa', fontSize: 13, lineHeight: 1.7 }}>
                You need at least one team to schedule a match.{' '}
                <a href="/teams" style={{ color: '#BFFF00' }}>Create a team first →</a>
              </div>
            ) : (
              <form onSubmit={handleSchedule}>
                <label style={S.label}>YOUR TEAM *</label>
                <select style={{ ...S.input, appearance: 'none' }} value={form.team_a_id}
                  onChange={e => setForm(f => ({ ...f, team_a_id: e.target.value }))} required>
                  <option value="">Select your team</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                </select>

                <label style={S.label}>OPPONENT</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {['external', 'myteam'].map(mode => {
                    const myTeamDisabled = mode === 'myteam' && teams.filter(t => t.id !== form.team_a_id).length === 0;
                    return (
                      <button key={mode} type="button"
                        disabled={myTeamDisabled}
                        style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                          cursor: myTeamDisabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                          background: opponentMode === mode ? '#BFFF00' : '#1a1a1a',
                          color: opponentMode === mode ? '#000' : myTeamDisabled ? '#333' : '#aaa',
                          border: opponentMode === mode ? 'none' : '1px solid #333',
                          opacity: myTeamDisabled ? 0.4 : 1 }}
                        onClick={() => !myTeamDisabled && setOpponentMode(mode)}>
                        {mode === 'external' ? 'EXTERNAL TEAM' : 'MY TEAM'}
                      </button>
                    );
                  })}
                </div>

                {opponentMode === 'external' ? (
                  <input style={S.input} placeholder="Opponent team name e.g. Thunder Strikers"
                    value={form.opponent_name} onChange={e => setForm(f => ({ ...f, opponent_name: e.target.value }))} required />
                ) : (
                  <select style={{ ...S.input, appearance: 'none' }} value={form.team_b_id}
                    onChange={e => setForm(f => ({ ...f, team_b_id: e.target.value }))} required>
                    <option value="">Select opponent team</option>
                    {teams.filter(t => t.id !== form.team_a_id).map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                  </select>
                )}

                <label style={S.label}>MATCH DATE *</label>
                <input type="date" style={S.input} value={form.match_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, match_date: e.target.value }))} required />

                <label style={S.label}>MATCH TIME *</label>
                <input type="time" style={S.input} value={form.match_time}
                  onChange={e => setForm(f => ({ ...f, match_time: e.target.value }))} required />

                <label style={S.label}>VENUE NOTE</label>
                <input style={S.input} placeholder="e.g. Pitch 1, Eagle Box Cricket" value={form.venue_note}
                  onChange={e => setForm(f => ({ ...f, venue_note: e.target.value }))} />

                {error && <div style={{ color: '#FF4444', fontSize: 12, marginBottom: 10 }}>{error}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" style={{ ...S.btn('#222', '#aaa'), flex: 1 }} onClick={() => setShowSchedule(false)}>CANCEL</button>
                  <button type="submit" style={{ ...S.btn('#BFFF00', '#000'), flex: 1 }} disabled={saving}>{saving ? 'SCHEDULING...' : 'SCHEDULE'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
