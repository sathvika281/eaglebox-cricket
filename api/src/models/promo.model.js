const { query } = require('../config/database');

const findByCode = async (code) => {
  const { rows } = await query(
    `SELECT * FROM promo_codes WHERE code = $1 AND is_active = TRUE`,
    [code.toUpperCase()]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const { rows } = await query(`SELECT * FROM promo_codes WHERE id = $1`, [id]);
  return rows[0] || null;
};

const findAll = async () => {
  const { rows } = await query(`SELECT * FROM promo_codes ORDER BY created_at DESC`);
  return rows;
};

const getUserUsageCount = async (promoId, userId) => {
  const { rows } = await query(
    `SELECT COUNT(*) FROM promo_usage WHERE promo_id = $1 AND user_id = $2`,
    [promoId, userId]
  );
  return parseInt(rows[0].count, 10);
};

const recordUsage = async ({ promoId, userId, bookingId, discountApplied }) => {
  const { rows } = await query(
    `INSERT INTO promo_usage (promo_id, user_id, booking_id, discount_applied)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [promoId, userId, bookingId || null, discountApplied]
  );
  await query(`UPDATE promo_codes SET usage_count = usage_count + 1, updated_at = NOW() WHERE id = $1`, [promoId]);
  return rows[0];
};

const create = async ({ code, description, discount_type, discount_value, min_booking_amount, max_discount_amount, usage_limit, user_limit, valid_from, valid_until, created_by }) => {
  const { rows } = await query(
    `INSERT INTO promo_codes (code, description, discount_type, discount_value, min_booking_amount, max_discount_amount, usage_limit, user_limit, valid_from, valid_until, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [code.toUpperCase(), description || null, discount_type, discount_value, min_booking_amount || 0, max_discount_amount || null, usage_limit || null, user_limit || 1, valid_from || new Date(), valid_until || null, created_by || null]
  );
  return rows[0];
};

module.exports = { findByCode, findById, findAll, getUserUsageCount, recordUsage, create };
