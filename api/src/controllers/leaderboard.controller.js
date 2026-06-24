const LeaderboardService = require('../services/leaderboard.service');
const TeamModel          = require('../models/team.model');

const getTeams = async (req, res, next) => {
  try {
    const teams = await LeaderboardService.getTopTeams(20);
    res.json({ success: true, data: { teams } });
  } catch (err) { next(err); }
};

const getPlayers = async (req, res, next) => {
  try {
    const players = await LeaderboardService.getTopPlayers(20);
    res.json({ success: true, data: { players } });
  } catch (err) { next(err); }
};

const getRewards = async (req, res, next) => {
  try {
    const earners = await LeaderboardService.getTopRewardEarners(20);
    res.json({ success: true, data: { earners } });
  } catch (err) { next(err); }
};

const getPublicTeam = async (req, res, next) => {
  try {
    const team    = await TeamModel.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    const members = await TeamModel.getMembers(req.params.id);
    const stats   = await LeaderboardService.getTopTeams(1000);
    const teamStat = stats.find(t => t.id === req.params.id) || {
      matches_played: 0, wins: 0, losses: 0, win_pct: 0,
    };
    res.json({ success: true, data: { team, members, stats: teamStat } });
  } catch (err) { next(err); }
};

module.exports = { getTeams, getPlayers, getRewards, getPublicTeam };
