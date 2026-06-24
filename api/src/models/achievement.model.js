const { query } = require('../config/database');

const award = async (userId, achievementType) => {
  const { rows } = await query(
    `INSERT INTO player_achievements (user_id, achievement_type)
     VALUES ($1, $2)
     ON CONFLICT (user_id, achievement_type) DO NOTHING
     RETURNING *`,
    [userId, achievementType]
  );
  return rows[0] || null;
};

const getForUser = async (userId) => {
  const { rows } = await query(
    `SELECT achievement_type, earned_at
     FROM player_achievements
     WHERE user_id = $1
     ORDER BY earned_at ASC`,
    [userId]
  );
  return rows;
};

module.exports = { award, getForUser };
