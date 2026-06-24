import api from './axios';

export const validatePromo = (code, booking_amount) => api.post('/api/v1/promos/validate', { code, booking_amount });
