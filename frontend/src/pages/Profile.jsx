import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();

  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!form.name.trim()) { setError('Name is required.'); return; }
    try {
      setLoading(true);
      await updateProfile({ name: form.name.trim(), phone: form.phone.trim() || undefined });
      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={s.page}>
      <TopBar title="PROFILE" />

      {/* Avatar + name */}
      <div style={s.heroSection}>
        <div style={s.heroBg} />
        <div style={s.heroOverlay} />
        <div style={s.avatarRing}>
          <div style={s.avatar}>{initials}</div>
        </div>
        <h2 style={s.userName}>{user?.name}</h2>
        <p style={s.userEmail}>{user?.email}</p>
        <div style={s.roleBadge}>
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
            {user?.role === 'admin' ? 'shield' : 'sports_cricket'}
          </span>
          {(user?.role || 'customer').toUpperCase()}
        </div>
      </div>

      <div style={s.content}>
        {success && <div style={s.successBanner}>{success}</div>}
        {error   && <div style={s.errorBanner}>{error}</div>}

        {/* Profile info card */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <p style={s.cardTag}>ACCOUNT INFO</p>
            {!editing && (
              <button style={s.editBtn} onClick={() => { setEditing(true); setSuccess(''); setError(''); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                EDIT
              </button>
            )}
          </div>

          {editing ? (
            <div style={s.editForm}>
              <div style={s.formField}>
                <label style={s.fieldLabel}>FULL NAME</label>
                <div style={s.inputWrap}>
                  <span className="material-symbols-outlined" style={s.inputIcon}>person</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    style={s.input}
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <div style={s.formField}>
                <label style={s.fieldLabel}>PHONE NUMBER</label>
                <div style={s.inputWrap}>
                  <span className="material-symbols-outlined" style={s.inputIcon}>phone</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    style={s.input}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
              <div style={s.editFormField}>
                <label style={s.fieldLabel}>EMAIL ADDRESS</label>
                <div style={{ ...s.inputWrap, opacity: 0.5 }}>
                  <span className="material-symbols-outlined" style={s.inputIcon}>mail</span>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    style={{ ...s.input, cursor: 'not-allowed' }}
                  />
                  <span style={s.lockedNote}>LOCKED</span>
                </div>
                <p style={s.helpText}>Email cannot be changed after registration.</p>
              </div>
              <div style={s.editBtns}>
                <button style={s.cancelBtn} onClick={() => { setEditing(false); setForm({ name: user?.name || '', phone: user?.phone || '' }); setError(''); }}>
                  Cancel
                </button>
                <button style={s.saveBtn} onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : 'SAVE CHANGES'}
                </button>
              </div>
            </div>
          ) : (
            <div style={s.infoRows}>
              {[
                { label: 'FULL NAME',  value: user?.name,  icon: 'person' },
                { label: 'EMAIL',      value: user?.email, icon: 'mail'   },
                { label: 'PHONE',      value: user?.phone || '—', icon: 'phone' },
                { label: 'ROLE',       value: (user?.role || 'customer').toUpperCase(), icon: 'badge' },
              ].map(({ label, value, icon }) => (
                <div key={label} style={s.infoRow}>
                  <span className="material-symbols-outlined" style={s.infoIcon}>{icon}</span>
                  <div style={s.infoText}>
                    <span style={s.infoLabel}>{label}</span>
                    <span style={s.infoValue}>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div style={s.card}>
          <p style={s.cardTag}>QUICK LINKS</p>
          {[
            { icon: 'calendar_today', label: 'Book a Slot',    sub: 'Reserve your arena time',    action: () => navigate('/booking')     },
            { icon: 'receipt_long',   label: 'My Bookings',    sub: 'View your booking history',  action: () => navigate('/my-bookings') },
            { icon: 'home',           label: 'Home',           sub: 'Back to the landing page',   action: () => navigate('/')            },
          ].map(({ icon, label, sub, action }) => (
            <button key={label} style={s.quickLink} onClick={action}>
              <span className="material-symbols-outlined" style={s.quickIcon}>{icon}</span>
              <div style={s.quickText}>
                <span style={s.quickLabel}>{label}</span>
                <span style={s.quickSub}>{sub}</span>
              </div>
              <span className="material-symbols-outlined" style={s.quickArrow}>chevron_right</span>
            </button>
          ))}
        </div>

        {/* Sign out */}
        <button style={s.signOutBtn} onClick={handleLogout}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          SIGN OUT
        </button>

        <p style={s.versionNote}>Eagle Cricket Elite v1.0.0</p>
      </div>

      <div style={{ height: '80px' }} />
      <BottomNav />
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#0D0D0D', color: '#fff', fontFamily: "'Hanken Grotesk', sans-serif" },

  heroSection: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '32px 16px 24px',
    borderBottom: '1px solid #1e1e22',
    position: 'relative', overflow: 'hidden',
    minHeight: '200px',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    backgroundImage: "url('/bg-9-apex-arena.png')",
    backgroundSize: 'cover', backgroundPosition: 'center center',
    zIndex: 0,
  },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(13,13,13,0.5) 0%, rgba(13,13,13,0.85) 100%)',
    zIndex: 1,
  },
  avatarRing: {
    width: '80px', height: '80px', borderRadius: '50%',
    border: '2px solid rgba(191,255,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '12px', position: 'relative', zIndex: 2,
  },
  avatar: {
    width: '68px', height: '68px', borderRadius: '50%',
    backgroundColor: '#BFFF00', color: '#000',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '22px',
    fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userName: { fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '4px', position: 'relative', zIndex: 2 },
  userEmail: { fontSize: '13px', color: '#ccc', marginBottom: '10px', position: 'relative', zIndex: 2 },
  roleBadge: {
    display: 'flex', alignItems: 'center', gap: '5px',
    backgroundColor: 'rgba(191,255,0,0.08)', border: '1px solid rgba(191,255,0,0.2)',
    borderRadius: '20px', padding: '5px 14px',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    letterSpacing: '0.12em', color: '#BFFF00', fontWeight: 600,
    position: 'relative', zIndex: 2,
  },

  content: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },

  successBanner: {
    backgroundColor: 'rgba(34,204,102,0.1)', border: '1px solid rgba(34,204,102,0.3)',
    borderRadius: '8px', color: '#22CC66', fontSize: '13px', padding: '10px 14px',
  },
  errorBanner: {
    backgroundColor: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
    borderRadius: '8px', color: '#FF4444', fontSize: '13px', padding: '10px 14px',
  },

  card: {
    backgroundColor: '#161616', border: '1px solid #222',
    borderRadius: '12px', padding: '16px', overflow: 'hidden',
  },
  cardHead: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '14px',
  },
  cardTag: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.2em', color: '#BFFF00',
  },
  editBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'none', border: '1px solid #333', color: '#aaa',
    padding: '5px 10px', borderRadius: '6px', cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.1em',
  },

  infoRows: { display: 'flex', flexDirection: 'column', gap: '1px' },
  infoRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 0', borderBottom: '1px solid #1e1e22',
  },
  infoIcon: { fontSize: '18px', color: '#444', flexShrink: 0 },
  infoText: { display: 'flex', flexDirection: 'column', gap: '2px' },
  infoLabel: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.12em', color: '#555',
  },
  infoValue: { fontSize: '14px', color: '#fff', fontWeight: 500 },

  editForm: { display: 'flex', flexDirection: 'column', gap: '4px' },
  formField: { marginBottom: '4px' },
  editFormField: { marginBottom: '4px' },
  fieldLabel: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '9px',
    letterSpacing: '0.15em', color: '#666', display: 'block',
    marginBottom: '6px', marginTop: '12px',
  },
  inputWrap: {
    display: 'flex', alignItems: 'center', backgroundColor: '#0D0D0D',
    border: '1px solid #2a2a2a', borderRadius: '8px', padding: '0 12px', gap: '8px',
  },
  inputIcon: { fontSize: '16px', color: '#444', flexShrink: 0 },
  input: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    color: '#fff', fontSize: '14px', padding: '12px 0',
    fontFamily: "'Hanken Grotesk', sans-serif",
  },
  lockedNote: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '8px',
    letterSpacing: '0.1em', color: '#444',
  },
  helpText: { fontSize: '11px', color: '#444', marginTop: '4px', paddingLeft: '2px' },
  editBtns: { display: 'flex', gap: '10px', marginTop: '16px' },
  cancelBtn: {
    flex: 1, backgroundColor: 'transparent', border: '1px solid #333',
    color: '#888', borderRadius: '8px', padding: '12px',
    fontSize: '13px', cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
  },
  saveBtn: {
    flex: 2, backgroundColor: '#BFFF00', color: '#000',
    border: 'none', borderRadius: '8px', padding: '12px',
    fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
    cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
  },

  quickLink: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
    backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
    padding: '12px 0', borderBottom: '1px solid #1e1e22', textAlign: 'left',
  },
  quickIcon: { fontSize: '20px', color: '#444', flexShrink: 0 },
  quickText: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  quickLabel: { fontSize: '14px', fontWeight: 600, color: '#fff' },
  quickSub: { fontSize: '11px', color: '#555' },
  quickArrow: { fontSize: '18px', color: '#333' },

  signOutBtn: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', backgroundColor: 'transparent', border: '1px solid #2a2a2a',
    borderRadius: '10px', padding: '14px', color: '#FF4444',
    fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em',
    cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
  },
  versionNote: {
    textAlign: 'center', fontFamily: "'JetBrains Mono', monospace",
    fontSize: '9px', letterSpacing: '0.1em', color: '#2a2a2a', paddingBottom: '8px',
  },
};
