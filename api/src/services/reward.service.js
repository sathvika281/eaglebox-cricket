const RewardModel = require('../models/reward.model');

const getMyRewards = async (userId) => {
  const [balance, history] = await Promise.all([
    RewardModel.getBalance(userId),
    RewardModel.getHistory(userId),
  ]);
  return { balance, ...history };
};

const earnForPayment = async (userId, amount, bookingId) => {
  const points = RewardModel.pointsForAmount(amount);
  if (points <= 0) return null;
  return RewardModel.addPoints(userId, points, 'payment_success', `Earned ${points} pts for ₹${amount} payment`, bookingId);
};

const earnForCompletion = async (userId, bookingId) => {
  return RewardModel.addPoints(userId, 5, 'booking_completed', 'Bonus 5 pts for completing a match', bookingId);
};

const getBalance = async (userId) => RewardModel.getBalance(userId);

module.exports = { getMyRewards, earnForPayment, earnForCompletion, getBalance };
