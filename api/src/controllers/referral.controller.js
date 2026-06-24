const ReferralService = require('../services/referral.service');

const getMyReferrals = async (req, res, next) => {
  try {
    const data = await ReferralService.getReferralInfo(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getMyReferrals };
