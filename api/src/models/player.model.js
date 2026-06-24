const { query } = require('../config/database');

const _generateCricketId = async () => {
  const { rows } = await query("SELECT nextval('cricket_id_seq') AS seq");
  const year = new Date().getFullYear();
  const seq  = String(rows[0].seq).padStart(6, '0');
  return `ECB-${year}-${seq}`;
};

const getOrCreate = async (userId) => {
  const { rows: existing } = await query(
    'SELECT * FROM player_profiles WHERE user_id = $1',
    [userId]
  );
  if (existing[0]) return existing[0];

  const cricketId = await _generateCricketId();
  const { rows } = await query(
    `INSERT INTO player_profiles (user_id, cricket_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING *`,
    [userId, cricketId]
  );
  if (rows[0]) return rows[0];
  // Race condition: another concurrent request created it first
  const { rows: found } = await query(
    'SELECT * FROM player_profiles WHERE user_id = $1',
    [userId]
  );
  return found[0];
};

const findByCricketId = async (cricketId) => {
  const { rows } = await query(
    `SELECT pp.*, u.name, u.created_at AS joined_at
     FROM player_profiles pp
     JOIN users u ON u.id = pp.user_id
     WHERE UPPER(pp.cricket_id) = UPPER($1) AND u.is_deleted = FALSE`,
    [cricketId]
  );
  return rows[0] || null;
};

const update = async (userId, fields) => {
  const keys   = Object.keys(fields);
  const values = Object.values(fields);
  const set    = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const { rows } = await query(
    `UPDATE player_profiles SET ${set}, updated_at = NOW()
     WHERE user_id = $${keys.length + 1}
     RETURNING *`,
    [...values, userId]
  );
  return rows[0] || null;
};

const getStats = async (userId) => {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM bookings     WHERE user_id      = $1 AND is_deleted = FALSE)::int          AS total_bookings,
       (SELECT COUNT(*) FROM matches      WHERE created_by   = $1 AND status != 'cancelled')::int       AS matches_scheduled,
       (SELECT COUNT(*) FROM matches      WHERE created_by   = $1 AND status = 'completed')::int        AS matches_completed,
       (SELECT COUNT(*) FROM team_members WHERE user_id      = $1 AND is_active = TRUE)::int            AS teams_joined,
       (SELECT COUNT(*) FROM teams        WHERE registered_by= $1 AND is_deleted = FALSE)::int          AS teams_created,
       COALESCE((SELECT lifetime_points   FROM reward_points WHERE user_id = $1), 0)::int               AS lifetime_points,
       COALESCE((SELECT total_points      FROM reward_points WHERE user_id = $1), 0)::int               AS total_points,
       (SELECT COUNT(*) FROM referrals    WHERE referrer_id  = $1 AND status = 'completed')::int        AS referrals_completed`,
    [userId]
  );
  return rows[0];
};

const getTimeline = async (userId, limit = 30) => {
  const { rows } = await query(
    `(
       SELECT 'booking_created'    AS activity_type,
              'Booked a slot'      AS description,
              b.id                 AS entity_id,
              'booking'            AS entity_type,
              b.created_at
       FROM bookings b
       WHERE b.user_id = $1 AND b.is_deleted = FALSE
     )
     UNION ALL
     (
       SELECT 'match_scheduled'                                                  AS activity_type,
              CONCAT('Scheduled a match on ',
                TO_CHAR(m.match_date::date, 'DD Mon YYYY'))                     AS description,
              m.id                                                               AS entity_id,
              'match'                                                            AS entity_type,
              m.created_at
       FROM matches m
       WHERE m.created_by = $1 AND m.status != 'cancelled'
     )
     UNION ALL
     (
       SELECT 'team_created'                                                     AS activity_type,
              CONCAT('Created team ''', t.team_name, '''')                      AS description,
              t.id                                                               AS entity_id,
              'team'                                                             AS entity_type,
              t.created_at
       FROM teams t
       WHERE t.registered_by = $1 AND t.is_deleted = FALSE
     )
     UNION ALL
     (
       SELECT 'team_joined'                                                      AS activity_type,
              CONCAT('Joined team ''', t.team_name, '''')                       AS description,
              tm.team_id                                                         AS entity_id,
              'team'                                                             AS entity_type,
              COALESCE(tm.joined_at, NOW())                                     AS created_at
       FROM team_members tm
       JOIN teams t ON t.id = tm.team_id AND t.is_deleted = FALSE
       WHERE tm.user_id = $1 AND tm.is_active = TRUE AND t.registered_by != $1
     )
     UNION ALL
     (
       SELECT 'referral_completed'                                               AS activity_type,
              'Referral completed — friend made their first booking'             AS description,
              r.id                                                               AS entity_id,
              'referral'                                                         AS entity_type,
              COALESCE(r.completed_at, r.created_at)                            AS created_at
       FROM referrals r
       WHERE r.referrer_id = $1 AND r.status = 'completed'
     )
     UNION ALL
     (
       SELECT 'achievement_earned'  AS activity_type,
              pa.achievement_type   AS description,
              pa.id                 AS entity_id,
              'achievement'         AS entity_type,
              pa.earned_at          AS created_at
       FROM player_achievements pa
       WHERE pa.user_id = $1
     )
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
};

module.exports = { getOrCreate, findByCricketId, update, getStats, getTimeline };
