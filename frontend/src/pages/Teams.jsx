import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTeams, createTeam, deleteTeam } from '../api/teams.api';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const S = {
  page:    { minHeight: '100vh', background: '#0D0D0D', color: '#fff', paddingBottom: 80, fontFamily: "'JetBrains Mono', monospace" },
  body:    { padding: '16px' },
  card:    { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, marginBottom: 12 },
  badge:   (c) => ({ background: c + '22', color: c, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }),
  btn:     (bg, col) => ({ background: bg, color: col, border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }),
  input:   { width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' },
  label:   { color: '#aaa', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal:   { background: '#1a1a1a', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, border: '1px solid #2a2a2a' },
};

export default function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]       = useState({ team_name: '', description: '', captain_name: '', captain_phone: '' });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const fetchTeams = useCallback(async () => {
    try { setLoading(true); const { data } = await getMyTeams(); setTeams(data.teams || []); }
    catch(e) { setError('Failed to load teams'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTeam(form);
      setShowCreate(false);
      setForm({ team_name: '', description: '', captain_name: '', captain_phone: '' });
      fetchTeams();
    } catch(err) { setError(err.response?.data?.message || 'Failed to create team'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team?')) return;
    try { await deleteTeam(id); fetchTeams(); }
    catch(e) { setError('Failed to delete team'); }
  };

  return (
    <div style={S.page}>
      <TopBar title="MY TEAMS" />
      <div style={S.body}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: '#aaa', fontSize: 12 }}>{teams.length} team{teams.length !== 1 ? 's' : ''}</div>
          <button style={S.btn('#BFFF00', '#000')} onClick={() => setShowCreate(true)}>+ CREATE TEAM</button>
        </div>

        {error && <div style={{ background: '#FF444422', border: '1px solid #FF4444', borderRadius: 8, padding: 12, color: '#FF4444', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', color: '#555', padding: 40 }}>Loading teams...</div>
        ) : teams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 52, color: '#BFFF00', display: 'block', marginBottom: 12 }}>groups</span>
            <div style={{ color: '#aaa', marginBottom: 16 }}>No teams yet. Create your first team!</div>
            <button style={S.btn('#BFFF00', '#000')} onClick={() => setShowCreate(true)}>Create Team</button>
          </div>
        ) : (
          teams.map(team => (
            <div key={team.id} style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{team.team_name}</div>
                  <div style={{ color: '#aaa', fontSize: 12 }}>Captain: {team.captain_name}</div>
                </div>
                <span style={S.badge(team.status === 'active' ? '#22CC66' : '#888')}>{team.status?.toUpperCase()}</span>
              </div>
              {team.description && <div style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>{team.description}</div>}
              <div style={{ color: '#aaa', fontSize: 12, marginBottom: 12 }}>
                <span style={{ background: '#BFFF0022', color: '#BFFF00', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>
                  {team.member_count || 0} players
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={S.btn('#222', '#fff')} onClick={() => navigate(`/teams/${team.id}`)}>VIEW TEAM</button>
                <button style={S.btn('#FF444422', '#FF4444')} onClick={() => handleDelete(team.id)}>DELETE</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <div style={S.overlay} onClick={() => setShowCreate(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>CREATE TEAM</div>
            <form onSubmit={handleCreate}>
              {[
                { key: 'team_name',    label: 'TEAM NAME *',    placeholder: 'e.g. Thunder Strikers' },
                { key: 'captain_name', label: 'CAPTAIN NAME *', placeholder: 'Your name' },
                { key: 'captain_phone',label: 'CAPTAIN PHONE',  placeholder: '+91 9999999999' },
                { key: 'description',  label: 'DESCRIPTION',    placeholder: 'About the team (optional)' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={S.label}>{label}</label>
                  <input style={S.input} placeholder={placeholder} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              {error && <div style={{ color: '#FF4444', fontSize: 12, marginBottom: 12 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" style={{ ...S.btn('#222', '#aaa'), flex: 1 }} onClick={() => setShowCreate(false)}>CANCEL</button>
                <button type="submit" style={{ ...S.btn('#BFFF00', '#000'), flex: 1 }} disabled={saving}>
                  {saving ? 'CREATING...' : 'CREATE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
