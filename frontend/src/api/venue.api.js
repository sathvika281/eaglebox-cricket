import api from './axios';

export const getVenue  = ()   => api.get('/api/v1/venues/default');
export const getVenues = ()   => api.get('/api/v1/venues');
