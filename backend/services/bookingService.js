const db = require('../db');

// Core booking logic - validates, checks availability, creates booking
async function createBooking({ customer_name, phone, email, slot_id, num_players, booking_type }) {
  if (!customer_name || !phone || !slot_id) {
    throw { status: 400, message: 'customer_name, phone, and slot_id are required' };
  }
  if (!/^\d{10}$/.test(phone)) {
    throw { status: 400, message: 'Phone number must be 10 digits' };
  }

  const [[slot]] = await db.query('SELECT * FROM slots WHERE id = ?', [slot_id]);
  if (!slot) throw { status: 404, message: 'Slot not found' };
  if (slot.status !== 'available') throw { status: 409, message: 'Slot is already booked or blocked' };

  const booking_id = 'EBC' + Date.now();
  await db.query('START TRANSACTION');
  try {
    await db.query(
      `INSERT INTO bookings (booking_id, customer_name, phone, email, slot_id, num_players, booking_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [booking_id, customer_name, phone, email || null, slot_id, num_players || 1, booking_type || 'regular']
    );
    await db.query('UPDATE slots SET status = "booked" WHERE id = ?', [slot_id]);
    await db.query('COMMIT');

    await logAction(booking_id, 'BOOKING_CREATED', `Booking created for slot ${slot_id} by ${customer_name}`);
    return { booking_id, slot, customer_name, phone };
  } catch (err) {
    await db.query('ROLLBACK');
    throw { status: 500, message: err.message };
  }
}

// Update booking status (confirm/cancel) with audit log
async function updateBookingStatus(id, status, updated_by = 'admin') {
  const allowed = ['confirmed', 'cancelled', 'pending'];
  if (!allowed.includes(status)) throw { status: 400, message: 'Invalid status' };

  const [[booking]] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
  if (!booking) throw { status: 404, message: 'Booking not found' };

  await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

  if (status === 'cancelled') {
    await db.query('UPDATE slots SET status = "available" WHERE id = ?', [booking.slot_id]);
  }
  if (status === 'confirmed') {
    await db.query('UPDATE slots SET status = "booked" WHERE id = ?', [booking.slot_id]);
  }

  await logAction(booking.booking_id, `STATUS_${status.toUpperCase()}`, `Status changed to ${status} by ${updated_by}`);
  return { booking_id: booking.booking_id, new_status: status };
}

// Log every action for audit trail
async function logAction(booking_id, action_type, description) {
  try {
    await db.query(
      'INSERT INTO action_history (booking_id, action_type, description) VALUES (?, ?, ?)',
      [booking_id, action_type, description]
    );
  } catch {
    // silently ignore if table not yet created
  }
}

// Get FAQ answers (rule-based)
function getFAQAnswer(question) {
  const q = question.toLowerCase();
  if (q.includes('price') || q.includes('cost') || q.includes('fee')) {
    return 'Each slot costs ₹500 for 1.5 hours. Corporate bookings may have custom pricing.';
  }
  if (q.includes('cancel')) {
    return 'Cancellations can be made through our admin. Please contact us with your Booking ID.';
  }
  if (q.includes('time') || q.includes('slot') || q.includes('available')) {
    return 'Slots are available from 9:00 AM to 9:00 PM daily. Each slot is 1.5 hours long.';
  }
  if (q.includes('player') || q.includes('team') || q.includes('member')) {
    return 'You can book for 6-22 players. Box cricket is played with teams of 6-11 per side.';
  }
  if (q.includes('tournament')) {
    return 'We host regular tournaments. Register your team through the Tournaments section.';
  }
  if (q.includes('membership')) {
    return 'We offer monthly and annual membership plans with discounted slot rates.';
  }
  if (q.includes('confirm')) {
    return 'Your booking is initially in pending status. Admin confirms it within 2 hours.';
  }
  if (q.includes('id') || q.includes('booking id')) {
    return 'Your Booking ID starts with EBC followed by a timestamp. Save it to track your booking.';
  }
  return 'Please contact Eagle Box Cricket at our venue or WhatsApp for more details.';
}

module.exports = { createBooking, updateBookingStatus, logAction, getFAQAnswer };
