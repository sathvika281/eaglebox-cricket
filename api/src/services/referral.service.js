const ReferralModel      = require('../models/referral.model');
const RewardModel        = require('../models/reward.model');
const ActivityService    = require('./activity.service');
const AchievementService = require('./achievement.service');

const REFERRER_POINTS = 100;
const REFERRED_POINTS = 50;

const getReferralInfo = async (userId) => {
  const { rows } = await require('../config/database').query(
    'SELECT referral_code FROM users WHERE id = $1',
    [userId]
  );
  const code = rows[0]?.referral_code;
  const stats = await ReferralModel.getReferralStats(userId);
  const list  = await ReferralModel.getReferralsList(userId);
  return { referral_code: code, stats, referrals: list };
};

const processReferral = async (newUserId, referralCode) => {
  if (!referralCode) return;
  const referrer = await ReferralModel.findByReferralCode(referralCode);
  if (!referrer || referrer.id === newUserId) return;
  await ReferralModel.createReferral(referrer.id, newUserId);
};

const completeReferralOnBooking = async (userId) => {
  const isFirst = await ReferralModel.isFirstBooking(userId);
  if (!isFirst) return;

  const referral = await ReferralModel.getPendingReferral(userId);
  if (!referral) return;

  const completed = await ReferralModel.completeReferral(userId);
  if (!completed) return;

  await Promise.all([
    RewardModel.addPoints(referral.referrer_id, REFERRER_POINTS, 'referral_bonus',
      'Referral reward — friend made first booking', referral.id),
    RewardModel.addPoints(userId, REFERRED_POINTS, 'referral_bonus',
      'Welcome bonus — joined via referral', referral.id),
  ]);

  ActivityService.log(referral.referrer_id, ActivityService.TYPES.REFERRAL_COMPLETED,
    `Referral completed — earned ${REFERRER_POINTS} points`, referral.id, 'referral').catch(() => {});
  ActivityService.log(userId, ActivityService.TYPES.REFERRAL_COMPLETED,
    `Joined via referral — earned ${REFERRED_POINTS} welcome points`, referral.id, 'referral').catch(() => {});
  AchievementService.checkAndAwardAll(referral.referrer_id).catch(() => {});
  AchievementService.checkAndAwardAll(userId).catch(() => {});
};

module.exports = { getReferralInfo, processReferral, completeReferralOnBooking };
