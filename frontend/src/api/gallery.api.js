import api from './axios';

export const getAllPhotos    = () => api.get('/api/v1/gallery');
export const getMatchPhotos = (matchId) => api.get(`/api/v1/matches/${matchId}/photos`);
export const addMatchPhoto  = (matchId, data) => api.post(`/api/v1/matches/${matchId}/photos`, data);
export const deletePhoto    = (matchId, photoId) => api.delete(`/api/v1/matches/${matchId}/photos/${photoId}`);

export const uploadPhoto = (file) => {
  const form = new FormData();
  form.append('photo', file);
  return api.post('/api/v1/upload/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};
