const { query, getClient } = require('../config/database');
const { generateToken } = require('../services/qr.service');

const create = async ({ booking_id, user_id, razorpay_order_id, amount }) => {
  const { rows } = await query(
    `INSERT INTO payments (booking_id, user_id, razorpay_order_id, amount, currency, status)
     VALUES ($1, $2, $3, $4, 'INR', 'created')
     RETURNING *`,
    [booking_id, user_id, razorpay_order_id, amount]
  );
  return rows[0];
};

const markPaid = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { rows: [payment] } = await client.query(
      `UPDATE payments
       SET razorpay_payment_id = $1, razorpay_signature = $2, status = 'paid', paid_at = NOW(), updated_at = NOW()
       WHERE razorpay_order_id = $3
       RETURNING *`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id]
    );

    if (!payment) throw Object.assign(new Error('Payment record not found'), { statusCode: 404, expose: true });

    const verificationToken = generateToken();
    await client.query(
      `UPDATE bookings SET status = 'confirmed', payment_status = 'paid', verification_token = $1, qr_generated_at = NOW(), updated_at = NOW() WHERE id = $2`,
      [verificationToken, payment.booking_id]
    );

    await client.query(
      `INSERT INTO booking_events (booking_id, event_type, from_status, to_status, triggered_by, notes)
       VALUES ($1, 'BOOKING_CONFIRMED', 'pending', 'confirmed', $2, 'Confirmed via Razorpay payment')`,
      [payment.booking_id, payment.user_id]
    );

    await client.query('COMMIT');
    return payment;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const findByBookingId = async (booking_id) => {
  const { rows } = await query(
    `SELECT p.*, b.booking_ref, b.total_amount, b.status AS booking_status,
            s.slot_date, s.start_time, s.end_time
     FROM payments p
     JOIN bookings b ON p.booking_id = b.id
     JOIN slots s ON b.slot_id = s.id
     WHERE p.booking_id = $1
     ORDER BY p.created_at DESC`,
    [booking_id]
  );
  return rows;
};

const findByUserId = async (user_id) => {
  const { rows } = await query(
    `SELECT p.*, b.booking_ref, b.total_amount, b.status AS booking_status,
            s.slot_date, s.start_time, s.end_time
     FROM payments p
     JOIN bookings b ON p.booking_id = b.id
     JOIN slots s ON b.slot_id = s.id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC`,
    [user_id]
  );
  return rows;
};

const findByOrderId = async (razorpay_order_id) => {
  const { rows } = await query(
    'SELECT * FROM payments WHERE razorpay_order_id = $1',
    [razorpay_order_id]
  );
  return rows[0] || null;
};

module.exports = { create, markPaid, findByBookingId, findByUserId, findByOrderId };
