import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../api/auth.api';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserFromTokens } = useAuth();

  useEffect(() => {
    const token   = searchParams.get('token');
    const refresh = searchParams.get('refresh');

    if (!token) {
      navigate('/login?error=google_failed', { replace: true });
      return;
    }

    localStorage.setItem('ebc_access_token', token);
    if (refresh) localStorage.setItem('ebc_refresh_token', refresh);

    getMe()
      .then(({ data }) => {
        setUserFromTokens(data.user);
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        localStorage.removeItem('ebc_access_token');
        localStorage.removeItem('ebc_refresh_token');
        navigate('/login?error=google_failed', { replace: true });
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#BFFF00' }} />
      <p style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.1em' }}>
        SIGNING YOU IN...
      </p>
    </div>
  );
}
