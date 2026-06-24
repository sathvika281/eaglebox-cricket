const RewardService = require('../services/reward.service');
const R = require('../utils/response.utils');

const getMyRewards = async (req, res, next) => { try { const data = await RewardService.getMyRewards(req.user.id); return R.success(res, data); } catch(e){next(e);} };
const getBalance   = async (req, res, next) => { try { const balance = await RewardService.getBalance(req.user.id); return R.success(res, { balance }); } catch(e){next(e);} };

module.exports = { getMyRewards, getBalance };
