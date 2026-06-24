import api from './axios';

export const getMyRewards = ()     => api.get('/api/v1/rewards');
export const getBalance   = ()     => api.get('/api/v1/rewards/balance');
