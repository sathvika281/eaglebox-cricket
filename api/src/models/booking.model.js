const { query, getClient } = require('../config/database');

const generateRef = () =>
  'EBC' + Date.now().toString(36).toUpperCase().slice(-6) +
  Math.random().toString(36).toUpperCase().slice(2, 5);

const findAll = async ({ status, userId, search, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const conditions = ['b.is_deleted = FALSE'];
  const params = [];

  if (status) { params.push(status); conditions.push(`b.status = $${params.length}`); }
  if (userId) { params.push(userId); conditions.push(`b.user_id = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(u.name ILIKE $${params.length} OR u.phone ILIKE $${params.length} OR b.booking_ref ILIKE $${params.length})`);
  }

  const where = conditions.join(' AND ');
  const baseQuery = `
    FROM bookings b
    JOIN users u  ON b.user_id = u.id
    JOIN slots s  ON b.slot_id = s.id
    WHERE ${where}`;

  const [{ rows: data }, { rows: countRows }] = await Promise.all([
    query(
      `SELECT b.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
              s.slot_date, s.start_time, s.end_time, s.price AS slot_price
       ${baseQuery}
       ORDER BY b.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) ${baseQuery}`, params),
  ]);

  return { data, total: parseInt(countRows[0].count, 10) };
};

const findById = async (id) => {
  const { rows } = await query(
    `SELECT b.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
            s.slot_date, s.start_time, s.end_time, s.price AS slot_price
     FROM bookings b
     JOIN users u ON b.user_id = u.id
     JOIN slots s ON b.slot_id = s.id
     WHERE b.id = $1 AND b.is_deleted = FALSE`,
    [id]
  );
  return rows[0] || null;
};

const isSlotBooked = async (slotId) => {
  const { rows } = await query(
    `SELECT id FROM bookings
     WHERE slot_id = $1 AND status IN ('pending','confirmed') AND is_deleted = FALSE
     LIMIT 1`,
    [slotId]
  );
  return rows.length > 0;
};

const create = async ({ user_id, slot_id, num_players, total_amount, notes }) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const booking_ref = generateRef();
    const { rows: [booking] } = await client.query(
      `INSERT INTO bookings (booking_ref, user_id, slot_id, num_players, total_amount, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [booking_ref, user_id, slot_id, num_players, total_amount, notes || null]
    );

    await client.query(
      `UPDATE slots SET status = 'booked', updated_at = NOW() WHERE id = $1`,
      [slot_id]
    );

    await client.query(
      `INSERT INTO booking_events (booking_id, event_type, to_status, triggered_by, notes)
       VALUES ($1,'BOOKING_CREATED','pending',$2,'Booking created by customer')`,
      [booking.id, user_id]
    );

    await client.query('COMMIT');
    return booking;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateStatus = async (id, status, triggeredBy, notes) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { rows: [current] } = await client.query(
      `SELECT id, status, slot_id FROM bookings WHERE id = $1 AND is_deleted = FALSE`,
      [id]
    );
    if (!current) throw Object.assign(new Error('Booking not found'), { statusCode: 404, expose: true });

    const { rows: [updated] } = await client.query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    await client.query(
      `INSERT INTO booking_events (booking_id, event_type, from_status, to_status, triggered_by, notes)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, `BOOKING_${status.toUpperCase()}`, current.status, status, triggeredBy, notes || null]
    );

    if (status === 'cancelled') {
      await client.query(
        `UPDATE slots SET status = 'available', updated_at = NOW() WHERE id = $1`,
        [current.slot_id]
      );
    }

    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const softDelete = async (id) => {
  const { rows } = await query(
    `UPDATE bookings SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND is_deleted = FALSE RETURNING id`,
    [id]
  );
  return rows[0] || null;
};

module.exports = { findAll, findById, isSlotBooked, create, updateStatus, softDelete };
