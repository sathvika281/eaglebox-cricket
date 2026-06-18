import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getMe, updateMe } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('ebc_access_token');
    localStorage.removeItem('ebc_refresh_token');
    setUser(null);
  }, []);

  useEffect(() => {
    const handleLogout = () => clearAuth();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [clearAuth]);

  useEffect(() => {
    const token = localStorage.getItem('ebc_access_token');
    if (!token) { setLoading(false); return; }

    getMe()
      .then(({ data }) => setUser(data.user))
      .catch(() => clearAuth())
      .finally(() => setLoading(false));
  }, [clearAuth]);

  const login = async (email, password) => {
    const { data } = await apiLogin(email, password);
    localStorage.setItem('ebc_access_token', data.accessToken);
    localStorage.setItem('ebc_refresh_token', data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('ebc_refresh_token');
    try { await apiLogout(refreshToken); } catch (_) {}
    clearAuth();
  };

  const updateProfile = async (fields) => {
    const { data } = await updateMe(fields);
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
