const { query } = require('../config/database');

const findAll = async () => {
  const { rows } = await query(`SELECT * FROM venues WHERE is_active = TRUE ORDER BY created_at`);
  return rows;
};

const findById = async (id) => {
  const { rows } = await query(`SELECT * FROM venues WHERE id = $1 AND is_active = TRUE`, [id]);
  return rows[0] || null;
};

const findFirst = async () => {
  const { rows } = await query(`SELECT * FROM venues WHERE is_active = TRUE LIMIT 1`);
  return rows[0] || null;
};

const update = async (id, fields) => {
  const allowed = ['name', 'description', 'address', 'city', 'state', 'pincode', 'latitude', 'longitude',
                   'phone', 'email', 'operating_hours', 'facilities', 'rules', 'photos', 'google_maps_url', 'is_active'];
  const keys = Object.keys(fields).filter(k => allowed.includes(k));
  if (!keys.length) return findById(id);
  const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const { rows } = await query(
    `UPDATE venues SET ${set}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...keys.map(k => fields[k]), id]
  );
  return rows[0] || null;
};

module.exports = { findAll, findById, findFirst, update };
