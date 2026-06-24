import api from './axios';

export const getMyReferrals = () => api.get('/api/v1/referrals');
