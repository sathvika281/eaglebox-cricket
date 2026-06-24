const { query, getClient } = require('../config/database');

const findAllByUser = async (userId) => {
  const { rows } = await query(
    `SELECT t.*,
            COUNT(tm.id) FILTER (WHERE tm.is_active = TRUE) AS member_count
     FROM teams t
     LEFT JOIN team_members tm ON tm.team_id = t.id
     WHERE t.registered_by = $1 AND t.is_deleted = FALSE
     GROUP BY t.id
     ORDER BY t.created_at DESC`,
    [userId]
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await query(
    `SELECT t.*, u.name AS owner_name
     FROM teams t
     LEFT JOIN users u ON u.id = t.registered_by
     WHERE t.id = $1 AND t.is_deleted = FALSE`,
    [id]
  );
  return rows[0] || null;
};

const getMembers = async (teamId) => {
  const { rows } = await query(
    `SELECT tm.*, u.name AS linked_user_name, u.email AS linked_user_email
     FROM team_members tm
     LEFT JOIN users u ON u.id = tm.user_id
     WHERE tm.team_id = $1 AND tm.is_active = TRUE
     ORDER BY CASE tm.role WHEN 'captain' THEN 1 WHEN 'vice_captain' THEN 2 ELSE 3 END, tm.joined_at`,
    [teamId]
  );
  return rows;
};

const create = async ({ team_name, description, logo_url, captain_name, captain_phone, captain_email, registered_by }) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { rows: [team] } = await client.query(
      `INSERT INTO teams (team_name, description, logo_url, captain_name, captain_phone, captain_email, registered_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [team_name, description || null, logo_url || null, captain_name, captain_phone || null, captain_email || null, registered_by]
    );
    await client.query(
      `INSERT INTO team_members (team_id, user_id, player_name, player_phone, player_email, role)
       VALUES ($1,$2,$3,$4,$5,'captain')`,
      [team.id, registered_by, captain_name, captain_phone || null, captain_email || null]
    );
    await client.query('COMMIT');
    return team;
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
};

const update = async (id, fields) => {
  const allowed = ['team_name', 'description', 'logo_url', 'captain_name', 'captain_phone', 'captain_email', 'status'];
  const keys = Object.keys(fields).filter(k => allowed.includes(k));
  if (!keys.length) return findById(id);
  const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const { rows } = await query(
    `UPDATE teams SET ${set}, updated_at = NOW() WHERE id = $${keys.length + 1} AND is_deleted = FALSE RETURNING *`,
    [...keys.map(k => fields[k]), id]
  );
  return rows[0] || null;
};

const softDelete = async (id) => {
  const { rows } = await query(
    `UPDATE teams SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1 AND is_deleted = FALSE RETURNING id`,
    [id]
  );
  return rows[0] || null;
};

const addMember = async ({ team_id, user_id, player_name, player_phone, player_email, role, jersey_number }) => {
  const { rows } = await query(
    `INSERT INTO team_members (team_id, user_id, player_name, player_phone, player_email, role, jersey_number)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [team_id, user_id || null, player_name, player_phone || null, player_email || null, role || 'player', jersey_number || null]
  );
  return rows[0];
};

const removeMember = async (memberId) => {
  const { rows } = await query(
    `UPDATE team_members SET is_active = FALSE WHERE id = $1 AND is_active = TRUE RETURNING id`,
    [memberId]
  );
  return rows[0] || null;
};

const assignCaptain = async (teamId, memberId) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE team_members SET role = 'player' WHERE team_id = $1 AND role = 'captain'`,
      [teamId]
    );
    await client.query(
      `UPDATE teams SET captain_name = (SELECT player_name FROM team_members WHERE id = $1),
                        captain_phone = (SELECT player_phone FROM team_members WHERE id = $1),
                        captain_email = (SELECT player_email FROM team_members WHERE id = $1),
                        updated_at = NOW()
       WHERE id = $2`,
      [memberId, teamId]
    );
    const { rows: [member] } = await client.query(
      `UPDATE team_members SET role = 'captain' WHERE id = $1 RETURNING *`,
      [memberId]
    );
    await client.query('COMMIT');
    return member;
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
};

module.exports = { findAllByUser, findById, getMembers, create, update, softDelete, addMember, removeMember, assignCaptain };
