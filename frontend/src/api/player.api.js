import api from './axios';

export const getMyProfile      = ()           => api.get('/api/v1/player/profile');
export const getMyStats        = ()           => api.get('/api/v1/player/stats');
export const getMyAchievements = ()           => api.get('/api/v1/player/achievements');
export const getMyActivity     = ()           => api.get('/api/v1/player/activity');
export const getMyQRCode       = ()           => api.get('/api/v1/player/qr');
export const updateMyProfile   = (data)       => api.patch('/api/v1/player/profile', data);
export const getPublicProfile  = (cricketId)  => api.get(`/api/v1/player/${cricketId}`);
