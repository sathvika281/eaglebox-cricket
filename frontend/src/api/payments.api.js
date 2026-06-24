import api from './axios';

export const createOrder = (bookingId) =>
  api.post(`/api/v1/payments/bookings/${bookingId}/create-order`);

export const verifyPayment = (payload) =>
  api.post('/api/v1/payments/verify', payload);

export const getMyPayments = () =>
  api.get('/api/v1/payments/mine');

export const getPaymentsByBooking = (bookingId) =>
  api.get(`/api/v1/payments/bookings/${bookingId}`);

export const notifyPaymentFailed = (bookingId) =>
  api.post(`/api/v1/payments/bookings/${bookingId}/notify-failed`);
