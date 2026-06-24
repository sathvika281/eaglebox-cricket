const { query } = require('../config/database');

const findByReferralCode = async (code) => {
  const { rows } = await query(
    'SELECT id, name, email, referral_code FROM users WHERE referral_code = $1 AND is_deleted = FALSE',
    [code.toUpperCase()]
  );
  return rows[0] || null;
};

const createReferral = async (referrerId, referredId) => {
  const { rows } = await query(
    `INSERT INTO referrals (referrer_id, referred_id) VALUES ($1, $2)
     ON CONFLICT (referred_id) DO NOTHING RETURNING *`,
    [referrerId, referredId]
  );
  return rows[0] || null;
};

const completeReferral = async (referredId) => {
  const { rows } = await query(
    `UPDATE referrals SET status = 'completed', completed_at = NOW()
     WHERE referred_id = $1 AND status = 'pending'
     RETURNING *`,
    [referredId]
  );
  return rows[0] || null;
};

const getReferralStats = async (userId) => {
  const { rows } = await query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
       COUNT(*) FILTER (WHERE status = 'pending')   AS pending_count,
       COUNT(*) AS total_count
     FROM referrals WHERE referrer_id = $1`,
    [userId]
  );
  return rows[0];
};

const getReferralsList = async (userId) => {
  const { rows } = await query(
    `SELECT r.id, r.status, r.created_at, r.completed_at,
            u.name AS referred_name, u.email AS referred_email
     FROM referrals r
     JOIN users u ON u.id = r.referred_id
     WHERE r.referrer_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );
  return rows;
};

const getPendingReferral = async (referredId) => {
  const { rows } = await query(
    'SELECT * FROM referrals WHERE referred_id = $1 AND status = $2',
    [referredId, 'pending']
  );
  return rows[0] || null;
};

const isFirstBooking = async (userId) => {
  const { rows } = await query(
    `SELECT COUNT(*) AS cnt FROM bookings
     WHERE user_id = $1 AND status IN ('confirmed', 'completed')`,
    [userId]
  );
  return parseInt(rows[0].cnt, 10) <= 1;
};

module.exports = {
  findByReferralCode, createReferral, completeReferral,
  getReferralStats, getReferralsList, getPendingReferral, isFirstBooking,
};
