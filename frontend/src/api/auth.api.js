import api from './axios';

export const login = (email, password) =>
  api.post('/api/v1/auth/login', { email, password });

export const register = (name, email, phone, password, referral_code) =>
  api.post('/api/v1/auth/register', { name, email, phone, password, ...(referral_code ? { referral_code } : {}) });

export const logout = (refreshToken) =>
  api.post('/api/v1/auth/logout', { refreshToken });

export const getMe = () =>
  api.get('/api/v1/auth/me');

export const updateMe = (data) =>
  api.patch('/api/v1/auth/me', data);

export const googleLogin = (access_token) =>
  api.post('/api/v1/auth/google', { access_token });
