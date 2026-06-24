import api from './axios';

export const createBooking = (slot_id, num_players, promo_code, rental_items) =>
  api.post('/api/v1/bookings', { slot_id, num_players, promo_code: promo_code || undefined, rental_items: rental_items?.length ? rental_items : undefined });

export const getMyBookings = (params = {}) =>
  api.get('/api/v1/bookings/mine', { params });

export const cancelBooking = (bookingId) =>
  api.put(`/api/v1/bookings/${bookingId}/cancel`);

export const rescheduleBooking = (bookingId, newSlotId) =>
  api.put(`/api/v1/bookings/${bookingId}/reschedule`, { newSlotId });
