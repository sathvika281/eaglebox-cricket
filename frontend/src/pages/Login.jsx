import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) { navigate('/dashboard', { replace: true }); return null; }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    try {
      setLoading(true);
      await login(form.email.trim(), form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.bgOverlay} />
      {/* Brand header */}
      <div style={s.brandWrap}>
        <div style={s.logoMark}>{'>'}</div>
        <h1 style={s.brandTitle}>EAGLE CRICKET ELITE</h1>
        <p style={s.brandSub}>HIGH INTENSITY BOX CRICKET</p>
      </div>

      {/* Card */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Welcome Back</h2>
        <p style={s.cardSub}>Sign in to access your matches and stats.</p>

        {error && <div style={s.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.fieldLabel}>EMAIL ADDRESS</label>
          <div style={s.inputWrap}>
            <span className="material-symbols-outlined" style={s.inputIcon}>mail</span>
            <input
              type="email"
              placeholder="e.g. player@eagle.com"
              value={form.email}
              onChange={set('email')}
              style={s.input}
              autoComplete="email"
            />
          </div>

          <div style={s.pwdRow}>
            <label style={s.fieldLabel}>PASSWORD</label>
            <button type="button" style={s.forgotBtn}>Forgot Password?</button>
          </div>
          <div style={s.inputWrap}>
            <span className="material-symbols-outlined" style={s.inputIcon}>lock</span>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              style={s.input}
              autoComplete="current-password"
            />
            <button
              type="button"
              style={s.eyeBtn}
              onClick={() => setShowPwd((v) => !v)}
            >
              <span className="material-symbols-outlined" style={s.eyeIcon}>
                {showPwd ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading ? 'ENTERING...' : 'ENTER THE PITCH'}
            {!loading && (
              <span className="material-symbols-outlined" style={{ fontSize: '16px', marginLeft: '8px' }}>
                arrow_forward
              </span>
            )}
          </button>
        </form>

        <div style={s.dividerRow}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>OR CONTINUE WITH</span>
          <div style={s.dividerLine} />
        </div>

        <div style={s.socialRow}>
          <button style={s.socialBtn} disabled>
            <span style={s.socialIcon}>G</span>
            Google
          </button>
          <button style={s.socialBtn} disabled>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>apple</span>
            Apple
          </button>
        </div>

        <p style={s.switchText}>
          New to the league?{' '}
          <Link to="/register" style={s.switchLink}>Create Account</Link>
        </p>
      </div>

      {/* Bottom stats */}
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
    backgroundImage: "url('/hero-stadium.png')",
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
    zIndex: 0,
    pointerEvents: 'none',
  },
  brandWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    position: 'relative', zIndex: 1,
  },
  logoMark: {
    width: '52px',
    height: '52px',
    backgroundColor: '#BFFF00',
    color: '#000',
    fontWeight: 900,
    fontSize: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: '8px',
    boxShadow: '0 0 24px rgba(191,255,0,0.3)',
  },
  brandTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '20px',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '0.08em',
    textAlign: 'center',
  },
  brandSub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.2em',
    color: '#666',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'rgba(22,22,22,0.92)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '28px 24px',
    position: 'relative', zIndex: 1,
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '6px',
  },
  cardSub: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
    lineHeight: 1.5,
  },
  errorBanner: {
    backgroundColor: 'rgba(255,68,68,0.1)',
    border: '1px solid rgba(255,68,68,0.3)',
    borderRadius: '6px',
    color: '#FF4444',
    fontSize: '13px',
    padding: '10px 14px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.15em',
    color: '#666',
    marginTop: '14px',
    marginBottom: '6px',
    display: 'block',
  },
  pwdRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '14px',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    padding: '0 12px',
    gap: '8px',
    marginBottom: '4px',
  },
  inputIcon: {
    fontSize: '18px',
    color: '#444',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '15px',
    padding: '13px 0',
    fontFamily: "'Hanken Grotesk', sans-serif",
  },
  eyeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: '18px',
    color: '#555',
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: '#BFFF00',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'Hanken Grotesk', sans-serif",
  },
  submitBtn: {
    marginTop: '20px',
    width: '100%',
    backgroundColor: '#BFFF00',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    padding: '15px',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    fontFamily: "'JetBrains Mono', monospace",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
    transition: 'opacity 0.15s',
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#222',
  },
  dividerText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.12em',
    color: '#444',
    whiteSpace: 'nowrap',
  },
  socialRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  socialBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#0D0D0D',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    color: '#666',
    padding: '12px',
    fontSize: '13px',
    cursor: 'not-allowed',
    fontFamily: "'Hanken Grotesk', sans-serif",
  },
  socialIcon: {
    fontWeight: 700,
    fontSize: '14px',
  },
  switchText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#666',
  },
  switchLink: {
    color: '#BFFF00',
    textDecoration: 'none',
    fontWeight: 600,
  },
  statsRow: {
    display: 'flex',
    gap: '32px',
    position: 'relative', zIndex: 1,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
  },
  statVal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
  },
  statLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.1em',
    color: '#444',
  },
};
