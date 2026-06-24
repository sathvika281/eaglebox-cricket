import api from './axios';

export const getNotifications = (params) => api.get('/api/v1/notifications', { params });
export const getUnreadCount   = ()       => api.get('/api/v1/notifications/unread-count');
export const markRead         = (id)     => api.put(`/api/v1/notifications/${id}/read`);
export const markAllRead      = ()       => api.put('/api/v1/notifications/read-all');
