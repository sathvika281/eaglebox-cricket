const { query } = require('../config/database');

const log = async (userId, activityType, description, entityId = null, entityType = null) => {
  const { rows } = await query(
    `INSERT INTO player_activity (user_id, activity_type, description, entity_id, entity_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, activityType, description, entityId, entityType]
  );
  return rows[0];
};

module.exports = { log };
