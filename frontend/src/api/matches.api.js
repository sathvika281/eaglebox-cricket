import api from './axios';

export const getMyMatches   = (params) => api.get('/api/v1/matches', { params });
export const getMatch       = (id)     => api.get(`/api/v1/matches/${id}`);
export const scheduleMatch  = (data)   => api.post('/api/v1/matches', data);
export const updateMatch    = (id, d)  => api.put(`/api/v1/matches/${id}`, d);
export const cancelMatch    = (id)     => api.put(`/api/v1/matches/${id}/cancel`);
