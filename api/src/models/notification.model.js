const { query } = require('../config/database');

const create = async ({ userId, type, subject, message, channel = 'in_app' }) => {
  const { rows } = await query(
    `INSERT INTO notifications (user_id, type, subject, message, channel, status)
     VALUES ($1,$2,$3,$4,$5,'sent') RETURNING *`,
    [userId, type, subject || null, message, channel]
  );
  return rows[0];
};

const findByUser = async (userId, { page = 1, limit = 20, unread } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = ['user_id = $1', "channel = 'in_app'"];
  const params = [userId];
  if (unread === 'true' || unread === true) { conditions.push('is_read = FALSE'); }
  const where = conditions.join(' AND ');
  const [{ rows: data }, { rows: countRows }] = await Promise.all([
    query(`SELECT * FROM notifications WHERE ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]),
    query(`SELECT COUNT(*) FROM notifications WHERE ${where}`, params),
  ]);
  return { data, total: parseInt(countRows[0].count, 10) };
};

const unreadCount = async (userId) => {
  const { rows } = await query(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE AND channel = 'in_app'`,
    [userId]
  );
  return parseInt(rows[0].count, 10);
};

const markRead = async (id, userId) => {
  const { rows } = await query(
    `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  return rows[0] || null;
};

const markAllRead = async (userId) => {
  const { rows } = await query(
    `UPDATE notifications SET is_read = TRUE, read_at = NOW()
     WHERE user_id = $1 AND is_read = FALSE AND channel = 'in_app' RETURNING id`,
    [userId]
  );
  return rows.length;
};

module.exports = { create, findByUser, unreadCount, markRead, markAllRead };
