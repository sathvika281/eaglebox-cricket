const { query } = require('../config/database');

const POINTS_PER_100 = 10;

const getOrCreate = async (userId) => {
  const { rows } = await query(
    `INSERT INTO reward_points (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [userId]
  );
  return rows[0];
};

const addPoints = async (userId, points, type, description, referenceId = null) => {
  await getOrCreate(userId);
  const { rows: [txn] } = await query(
    `INSERT INTO reward_transactions (user_id, points, type, description, reference_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [userId, points, type, description, referenceId]
  );
  const { rows: [updated] } = await query(
    `UPDATE reward_points
     SET total_points    = total_points + $1,
         lifetime_points = lifetime_points + GREATEST($1, 0),
         updated_at      = NOW()
     WHERE user_id = $2 RETURNING *`,
    [points, userId]
  );
  return { balance: updated, transaction: txn };
};

const getBalance = async (userId) => {
  const rp = await getOrCreate(userId);
  return rp;
};

const getHistory = async (userId, limit = 20, offset = 0) => {
  const { rows } = await query(
    `SELECT * FROM reward_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  const { rows: [{ count }] } = await query(
    `SELECT COUNT(*) FROM reward_transactions WHERE user_id = $1`, [userId]
  );
  return { transactions: rows, total: parseInt(count, 10) };
};

const pointsForAmount = (amount) => Math.floor(amount / 100) * POINTS_PER_100;

module.exports = { getOrCreate, addPoints, getBalance, getHistory, pointsForAmount };
