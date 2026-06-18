import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as apiRegister } from '../api/auth.api';

export default function Register() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) { navigate('/dashboard', { replace: true }); return null; }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { name, email, phone, password } = form;
    if (!name || !email || !phone || !password) { setError('All fields are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    try {
      setLoading(true);
      await apiRegister(name.trim(), email.trim(), phone.trim(), password);
      await login(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msgs = err.response?.data?.errors;
      if (msgs?.length) setError(msgs.map((e) => typeof e === 'string' ? e : e.message).join(' '));
      else setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.bgOverlay} />
      <div style={s.brandWrap}>
        <div style={s.logoMark}>{'>'}</div>
        <h1 style={s.brandTitle}>EAGLE CRICKET ELITE</h1>
        <p style={s.brandSub}>HIGH INTENSITY BOX CRICKET</p>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Join the Arena</h2>
        <p style={s.cardSub}>Create your account and start playing.</p>

        {error && <div style={s.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          {[
            { key: 'name',     icon: 'person',   type: 'text',     placeholder: 'Your full name',        label: 'FULL NAME' },
            { key: 'email',    icon: 'mail',     type: 'email',    placeholder: 'e.g. player@eagle.com', label: 'EMAIL ADDRESS' },
            { key: 'phone',    icon: 'phone',    type: 'tel',      placeholder: '10 digits, no spaces (e.g. 9876543210)', label: 'PHONE NUMBER' },
          ].map(({ key, icon, type, placeholder, label }) => (
            <React.Fragment key={key}>
              <label style={s.fieldLabel}>{label}</label>
              <div style={s.inputWrap}>
                <span className="material-symbols-outlined" style={s.inputIcon}>{icon}</span>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={set(key)}
                  style={s.input}
                />
              </div>
            </React.Fragment>
          ))}

          <label style={s.fieldLabel}>PASSWORD</label>
          <div style={s.inputWrap}>
            <span className="material-symbols-outlined" style={s.inputIcon}>lock</span>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={set('password')}
              style={s.input}
              autoComplete="new-password"
            />
            <button type="button" style={s.eyeBtn} onClick={() => setShowPwd((v) => !v)}>
              <span className="material-symbols-outlined" style={s.eyeIcon}>
                {showPwd ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'JOIN THE ARENA'}
            {!loading && (
              <span className="material-symbols-outlined" style={{ fontSize: '16px', marginLeft: '8px' }}>
                arrow_forward
              </span>
            )}
          </button>
        </form>

        <p style={s.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={s.switchLink}>Sign In</Link>
        </p>
      </div>

      <div style={s.statsRow}>
        {[['500+', 'ACTIVE PLAYERS'], ['24/7', 'COURT ACCESS'], ['PRO', 'TOURNAMENTS']].map(([v, l]) => (
          <div key={l} style={s.stat}>
            <span style={s.statVal}>{v}</span>
            <span style={s.statLabel}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0D0D0D',
    backgroundImage: "url('/bg-2-apex-arena.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px 40px',
    gap: '24px',
    position: 'relative',
  },
  bgOverlay: {
    position: 'fixed', inset: 0,
    background: 'linear-gradient(180deg, rgba(13,13,13,0.75) 0%, rgba(13,13,13,0.88) 100%)',
    zIndex: 0, pointerEvents: 'none',
  },
  brandWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', position: 'relative', zIndex: 1 },
  logoMark: {
    width: '52px', height: '52px', backgroundColor: '#BFFF00', color: '#000',
    fontWeight: 900, fontSize: '22px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: '10px',
    fontFamily: "'JetBrains Mono', monospace", marginBottom: '8px',
    boxShadow: '0 0 24px rgba(191,255,0,0.3)',
  },
  brandTitle: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 700,
    color: '#fff', letterSpacing: '0.08em', textAlign: 'center',
  },
  brandSub: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    letterSpacing: '0.2em', color: '#666', textAlign: 'center',
  },
  card: {
    width: '100%', maxWidth: '420px',
    backgroundColor: 'rgba(22,22,22,0.92)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px', padding: '28px 24px',
    position: 'relative', zIndex: 1,
  },
  cardTitle: { fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '6px' },
  cardSub: { fontSize: '14px', color: '#666', marginBottom: '20px', lineHeight: 1.5 },
  errorBanner: {
    backgroundColor: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
    borderRadius: '6px', color: '#FF4444', fontSize: '13px',
    padding: '10px 14px', marginBottom: '16px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '4px' },
  fieldLabel: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    letterSpacing: '0.15em', color: '#666', marginTop: '14px', marginBottom: '6px', display: 'block',
  },
  inputWrap: {
    display: 'flex', alignItems: 'center', backgroundColor: '#0D0D0D',
    border: '1px solid #2a2a2a', borderRadius: '8px', padding: '0 12px',
    gap: '8px', marginBottom: '4px',
  },
  inputIcon: { fontSize: '18px', color: '#444', flexShrink: 0 },
  input: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    color: '#fff', fontSize: '15px', padding: '13px 0',
    fontFamily: "'Hanken Grotesk', sans-serif",
  },
  eyeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '4px', display: 'flex', alignItems: 'center',
  },
  eyeIcon: { fontSize: '18px', color: '#555' },
  submitBtn: {
    marginTop: '20px', width: '100%', backgroundColor: '#BFFF00', color: '#000',
    border: 'none', borderRadius: '8px', padding: '15px', fontSize: '13px',
    fontWeight: 700, letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace",
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  switchText: { textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '20px' },
  switchLink: { color: '#BFFF00', textDecoration: 'none', fontWeight: 600 },
  statsRow: { display: 'flex', gap: '32px', position: 'relative', zIndex: 1 },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' },
  statVal: { fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', fontWeight: 700, color: '#fff' },
  statLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', color: '#444' },
};
