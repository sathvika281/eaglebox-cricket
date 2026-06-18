const { query } = require('../config/database');

const log = async ({ userId, action, entityType, entityId, oldValues, newValues, ip, userAgent }) => {
  try {
    await query(
      `INSERT INTO audit_logs
         (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        userId     || null,
        action,
        entityType || null,
        entityId   || null,
        oldValues  ? JSON.stringify(oldValues)  : null,
        newValues  ? JSON.stringify(newValues)  : null,
        ip         || null,
        userAgent  || null,
      ]
    );
  } catch (err) {
    console.error('Audit log insert error:', err.message);
  }
};

const getByUser = async (userId, { limit = 50, offset = 0 } = {}) => {
  const { rows } = await query(
    `SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
};

module.exports = { log, getByUser };
