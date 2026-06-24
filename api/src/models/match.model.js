const { query } = require('../config/database');

const findAllForUser = async (userId, { status, page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = ['(m.created_by = $1 OR ta.registered_by = $1 OR tb.registered_by = $1)'];
  const params = [userId];
  if (status) { params.push(status); conditions.push(`m.status = $${params.length}`); }
  const where = conditions.join(' AND ');
  const { rows } = await query(
    `SELECT m.*,
            ta.team_name AS team_a_name, ta.captain_name AS team_a_captain,
            COALESCE(tb.team_name, m.opponent_name) AS team_b_name,
            tb.captain_name AS team_b_captain,
            u.name AS created_by_name
     FROM matches m
     JOIN teams ta  ON ta.id = m.team_a_id
     LEFT JOIN teams tb ON tb.id = m.team_b_id
     JOIN users u   ON u.id = m.created_by
     WHERE ${where}
     ORDER BY m.match_date DESC, m.match_time DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await query(
    `SELECT m.*,
            ta.team_name AS team_a_name, ta.captain_name AS team_a_captain,
            COALESCE(tb.team_name, m.opponent_name) AS team_b_name,
            tb.captain_name AS team_b_captain,
            u.name AS created_by_name
     FROM matches m
     JOIN teams ta  ON ta.id = m.team_a_id
     LEFT JOIN teams tb ON tb.id = m.team_b_id
     JOIN users u   ON u.id = m.created_by
     WHERE m.id = $1`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ team_a_id, team_b_id, opponent_name, slot_id, booking_id, match_date, match_time, venue_note, created_by }) => {
  const { rows } = await query(
    `INSERT INTO matches (team_a_id, team_b_id, opponent_name, slot_id, booking_id, match_date, match_time, venue_note, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [team_a_id, team_b_id || null, opponent_name || null, slot_id || null, booking_id || null, match_date, match_time, venue_note || null, created_by]
  );
  return rows[0];
};

const update = async (id, fields) => {
  const allowed = ['match_date', 'match_time', 'venue_note', 'status', 'result', 'winner_team_id'];
  const keys = Object.keys(fields).filter(k => allowed.includes(k));
  if (!keys.length) return findById(id);
  const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const { rows } = await query(
    `UPDATE matches SET ${set}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...keys.map(k => fields[k]), id]
  );
  return rows[0] || null;
};

module.exports = { findAllForUser, findById, create, update };
