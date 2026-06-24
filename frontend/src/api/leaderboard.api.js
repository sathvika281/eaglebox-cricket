import api from './axios';

export const getTopTeams    = () => api.get('/api/v1/leaderboard/teams');
export const getTopPlayers  = () => api.get('/api/v1/leaderboard/players');
export const getTopRewards  = () => api.get('/api/v1/leaderboard/rewards');
export const getPublicTeam  = (id) => api.get(`/api/v1/leaderboard/team/${id}`);
