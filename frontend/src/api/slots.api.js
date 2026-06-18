import api from './axios';

export const getSlots = (params = {}) =>
  api.get('/api/v1/slots', { params });
