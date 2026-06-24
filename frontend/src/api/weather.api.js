import api from './axios';

export const getCurrentWeather  = () => api.get('/api/v1/weather/current');
export const getWeatherForecast = () => api.get('/api/v1/weather/forecast');
