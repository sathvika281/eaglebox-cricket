import api from './axios';

export const login = (email, password) =>
  api.post('/api/v1/auth/login', { email, password });

export const register = (name, email, phone, password) =>
  api.post('/api/v1/auth/register', { name, email, phone, password });

export const logout = (refreshToken) =>
  api.post('/api/v1/auth/logout', { refreshToken });

export const getMe = () =>
  api.get('/api/v1/auth/me');

export const updateMe = (data) =>
  api.patch('/api/v1/auth/me', data);
