const { query } = require('../config/database');

const getTopTeams = async (limit = 20) => {
  const { rows } = await query(
    `SELECT t.id, t.team_name, t.logo_url, t.captain_name,
            COUNT(m.id)::int AS matches_played,
            COUNT(m.id) FILTER (WHERE m.winner_team_id = t.id)::int AS wins,
            COUNT(m.id) FILTER (
              WHERE m.status = 'completed'
              AND m.winner_team_id IS NOT NULL
              AND m.winner_team_id != t.id
            )::int AS losses,
            CASE WHEN COUNT(m.id) > 0
              THEN ROUND(COUNT(m.id) FILTER (WHERE m.winner_team_id = t.id)::numeric / COUNT(m.id) * 100)
              ELSE 0
            END AS win_pct
     FROM teams t
     LEFT JOIN matches m ON (m.team_a_id = t.id OR m.team_b_id = t.id)
       AND m.status IN ('completed', 'scheduled')
     WHERE t.is_deleted = FALSE
     GROUP BY t.id
     ORDER BY wins DESC, matches_played DESC, t.team_name
     LIMIT $1`,
    [limit]
  );
  return rows;
};

const getTopPlayers = async (limit = 20) => {
  const { rows } = await query(
    `SELECT u.id, u.name, u.email,
            COUNT(DISTINCT b.id)::int  AS total_bookings,
            COUNT(DISTINCT tm.team_id)::int AS teams_count,
            COALESCE(rp.total_points, 0)::int AS reward_points,
            (COUNT(DISTINCT b.id) * 5 + COALESCE(rp.total_points, 0) / 20)::int AS activity_score
     FROM users u
     LEFT JOIN bookings b    ON b.user_id = u.id AND b.status IN ('confirmed', 'completed')
     LEFT JOIN team_members tm ON tm.user_id = u.id AND tm.is_active = TRUE
     LEFT JOIN reward_points rp ON rp.user_id = u.id
     WHERE u.is_deleted = FALSE AND u.role = 'customer'
     GROUP BY u.id, rp.total_points
     ORDER BY activity_score DESC, total_bookings DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
};

const getTopRewardEarners = async (limit = 20) => {
  const { rows } = await query(
    `SELECT u.id, u.name, u.email,
            rp.total_points::int    AS total_points,
            rp.lifetime_points::int AS lifetime_points,
            rp.updated_at
     FROM reward_points rp
     JOIN users u ON u.id = rp.user_id
     WHERE u.is_deleted = FALSE
     ORDER BY rp.total_points DESC, rp.lifetime_points DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
};

module.exports = { getTopTeams, getTopPlayers, getTopRewardEarners };
