const PlayerService = require('../services/player.service');

const getMyProfile = async (req, res, next) => {
  try {
    const data = await PlayerService.getMyProfile(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const data = await PlayerService.getPublicProfile(req.params.cricketId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const { stats } = await PlayerService.getMyProfile(req.user.id);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

const getAchievements = async (req, res, next) => {
  try {
    const { achievements } = await PlayerService.getMyProfile(req.user.id);
    res.json({ success: true, data: achievements });
  } catch (err) { next(err); }
};

const getActivity = async (req, res, next) => {
  try {
    const { timeline } = await PlayerService.getMyProfile(req.user.id);
    res.json({ success: true, data: timeline });
  } catch (err) { next(err); }
};

const getQRCode = async (req, res, next) => {
  try {
    const data = await PlayerService.getQRCode(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const updated = await PlayerService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

module.exports = {
  getMyProfile,
  getPublicProfile,
  getStats,
  getAchievements,
  getActivity,
  getQRCode,
  updateProfile,
};
