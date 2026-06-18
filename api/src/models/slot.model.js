const { query } = require('../config/database');

const findAll = async ({ date, status, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const conditions = ['s.is_deleted = FALSE'];
  const params = [];

  if (date)   { params.push(date);   conditions.push(`s.slot_date = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`s.status = $${params.length}`); }

  const where = conditions.join(' AND ');

  const [{ rows: data }, { rows: countRows }] = await Promise.all([
    query(
      `SELECT s.*, u.name AS created_by_name
       FROM slots s
       LEFT JOIN users u ON s.created_by = u.id
       WHERE ${where}
       ORDER BY s.slot_date ASC, s.start_time ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) FROM slots s WHERE ${where}`, params),
  ]);

  return { data, total: parseInt(countRows[0].count, 10) };
};

const findById = async (id) => {
  const { rows } = await query(
    `SELECT s.*, u.name AS created_by_name
     FROM slots s
     LEFT JOIN users u ON s.created_by = u.id
     WHERE s.id = $1 AND s.is_deleted = FALSE`,
    [id]
  );
  return rows[0] || null;
};

const checkOverlap = async (slot_date, start_time, end_time, excludeId = null) => {
  const { rows } = await query(
    `SELECT id FROM slots
     WHERE slot_date = $1
       AND is_deleted = FALSE
       AND start_time < $3
       AND end_time   > $2
       AND ($4::UUID IS NULL OR id != $4)`,
    [slot_date, start_time, end_time, excludeId]
  );
  return rows.length > 0;
};

const create = async ({ slot_date, start_time, end_time, price, created_by }) => {
  const { rows } = await query(
    `INSERT INTO slots (slot_date, start_time, end_time, price, created_by)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [slot_date, start_time, end_time, price, created_by]
  );
  return rows[0];
};

const update = async (id, fields) => {
  const keys   = Object.keys(fields);
  const values = Object.values(fields);
  const set    = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const { rows } = await query(
    `UPDATE slots SET ${set}, updated_at = NOW()
     WHERE id = $${keys.length + 1} AND is_deleted = FALSE
     RETURNING *`,
    [...values, id]
  );
  return rows[0] || null;
};

const softDelete = async (id) => {
  const { rows } = await query(
    `UPDATE slots SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND is_deleted = FALSE RETURNING id`,
    [id]
  );
  return rows[0] || null;
};

const hasActiveBookings = async (slotId) => {
  const { rows } = await query(
    `SELECT id FROM bookings
     WHERE slot_id = $1 AND status IN ('pending','confirmed') AND is_deleted = FALSE
     LIMIT 1`,
    [slotId]
  );
  return rows.length > 0;
};

module.exports = { findAll, findById, checkOverlap, create, update, softDelete, hasActiveBookings };
