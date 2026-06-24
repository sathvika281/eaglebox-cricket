const { query } = require('../config/database');

const addPhoto = async ({ match_id, uploaded_by, photo_url, caption }) => {
  const { rows } = await query(
    `INSERT INTO match_photos (match_id, uploaded_by, photo_url, caption)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [match_id, uploaded_by, photo_url, caption || null]
  );
  return rows[0];
};

const getPhotos = async (matchId) => {
  const { rows } = await query(
    `SELECT mp.*, u.name AS uploader_name
     FROM match_photos mp
     JOIN users u ON u.id = mp.uploaded_by
     WHERE mp.match_id = $1
     ORDER BY mp.created_at DESC`,
    [matchId]
  );
  return rows;
};

const deletePhoto = async (photoId, userId) => {
  const { rows } = await query(
    'DELETE FROM match_photos WHERE id = $1 AND uploaded_by = $2 RETURNING id',
    [photoId, userId]
  );
  return rows[0] || null;
};

const getAllForUser = async (userId) => {
  const { rows } = await query(
    `SELECT mp.*, u.name AS uploader_name,
            m.match_date, m.match_time,
            ta.team_name AS team_a_name, tb.team_name AS team_b_name
     FROM match_photos mp
     JOIN matches m  ON m.id = mp.match_id
     JOIN teams ta   ON ta.id = m.team_a_id
     JOIN teams tb   ON tb.id = m.team_b_id
     JOIN users u    ON u.id = mp.uploaded_by
     WHERE mp.uploaded_by = $1
        OR m.team_a_id IN (SELECT team_id FROM team_members WHERE user_id = $1 AND is_active = TRUE)
        OR m.team_b_id IN (SELECT team_id FROM team_members WHERE user_id = $1 AND is_active = TRUE)
     ORDER BY mp.created_at DESC`,
    [userId]
  );
  return rows;
};

module.exports = { addPhoto, getPhotos, deletePhoto, getAllForUser };
