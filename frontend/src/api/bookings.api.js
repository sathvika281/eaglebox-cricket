import api from './axios';

export const createBooking = (slot_id, num_players) =>
  api.post('/api/v1/bookings', { slot_id, num_players });

export const getMyBookings = (params = {}) =>
  api.get('/api/v1/bookings/mine', { params });
