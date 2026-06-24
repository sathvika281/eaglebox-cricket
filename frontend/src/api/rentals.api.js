import api from './axios';

export const getRentalItems = () => api.get('/api/v1/rentals/items');
