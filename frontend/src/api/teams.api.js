import api from './axios';

export const getMyTeams        = ()             => api.get('/api/v1/teams');
export const getTeam           = (id)           => api.get(`/api/v1/teams/${id}`);
export const createTeam        = (data)         => api.post('/api/v1/teams', data);
export const updateTeam        = (id, data)     => api.put(`/api/v1/teams/${id}`, data);
export const deleteTeam        = (id)           => api.delete(`/api/v1/teams/${id}`);
export const addMember         = (id, data)     => api.post(`/api/v1/teams/${id}/members`, data);
export const removeMember      = (id, memberId) => api.delete(`/api/v1/teams/${id}/members/${memberId}`);
export const assignCaptain     = (id, memberId) => api.put(`/api/v1/teams/${id}/members/${memberId}/captain`);
