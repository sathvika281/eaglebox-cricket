const BookingModel = require('../models/booking.model');
const SlotModel    = require('../models/slot.model');
const AuditModel   = require('../models/audit.model');
const EmailService = require('./email.service');
const { query, getClient } = require('../config/database');

const CANCELLABLE = ['pending', 'confirmed'];
const RESCHEDULABLE = ['pending', 'confirmed', 'rescheduled'];

const _isFuture = (slotDate, startTime) => {
  // slotDate from pg is midnight of that date in local TZ (e.g. 2026-06-23T18:30:00Z = midnight IST June 24)
  const slotMidnight = new Date(slotDate);
  const [h, m] = (startTime || '00:00').split(':').map(Number);
  const slotDateTime = new Date(slotMidnight.getTime() + (h * 60 + m) * 60 * 1000);
  return slotDateTime > new Date();
};

const cancelBooking = async (bookingId, userId, req) => {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404, expose: true });
  if (booking.user_id !== userId) throw Object.assign(new Error('You can only cancel your own bookings'), { statusCode: 403, expose: true });
  if (!CANCELLABLE.includes(booking.status)) {
    throw Object.assign(new Error(`Cannot cancel a booking with status '${booking.status}'`), { statusCode: 400, expose: true });
  }

  if (!_isFuture(booking.slot_date, booking.start_time)) {
    throw Object.assign(new Error('Cannot cancel a past booking'), { statusCode: 400, expose: true });
  }

  const updated = await BookingModel.updateStatus(bookingId, 'cancelled', userId, 'Cancelled by customer');

  await AuditModel.log({
    userId, action: 'BOOKING_CANCELLED_BY_CUSTOMER',
    entityType: 'bookings', entityId: bookingId,
    oldValues: { status: booking.status }, newValues: { status: 'cancelled' },
    ip: req?.ip, userAgent: req?.headers?.['user-agent'],
  });

  EmailService.sendBookingCancellation({
    customerName:  booking.customer_name,
    customerEmail: booking.customer_email,
    bookingRef:    booking.booking_ref,
    slotDate:      booking.slot_date,
    startTime:     booking.start_time,
    endTime:       booking.end_time,
    amount:        booking.total_amount,
  });

  return updated;
};

const rescheduleBooking = async (bookingId, newSlotId, userId, req) => {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404, expose: true });
  if (booking.user_id !== userId) throw Object.assign(new Error('You can only reschedule your own bookings'), { statusCode: 403, expose: true });
  if (!RESCHEDULABLE.includes(booking.status)) {
    throw Object.assign(new Error(`Cannot reschedule a booking with status '${booking.status}'`), { statusCode: 400, expose: true });
  }

  if (!_isFuture(booking.slot_date, booking.start_time)) {
    throw Object.assign(new Error('Cannot reschedule a past booking'), { statusCode: 400, expose: true });
  }

  if (newSlotId === booking.slot_id) {
    throw Object.assign(new Error('New slot is the same as the current slot'), { statusCode: 400, expose: true });
  }

  const newSlot = await SlotModel.findById(newSlotId);
  if (!newSlot) throw Object.assign(new Error('New slot not found'), { statusCode: 404, expose: true });
  if (newSlot.status !== 'available') {
    throw Object.assign(new Error('Selected slot is not available'), { statusCode: 409, expose: true });
  }

  if (!_isFuture(newSlot.slot_date, newSlot.start_time)) {
    throw Object.assign(new Error('Cannot reschedule to a past slot'), { statusCode: 400, expose: true });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE slots SET status = 'available', updated_at = NOW() WHERE id = $1`,
      [booking.slot_id]
    );
    await client.query(
      `UPDATE slots SET status = 'booked', updated_at = NOW() WHERE id = $1`,
      [newSlotId]
    );

    const originalSlotId = booking.original_slot_id || booking.slot_id;
    const { rows: [updated] } = await client.query(
      `UPDATE bookings
       SET slot_id = $1, status = 'rescheduled', original_slot_id = $2,
           reschedule_count = reschedule_count + 1, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [newSlotId, originalSlotId, bookingId]
    );

    await client.query(
      `INSERT INTO booking_events (booking_id, event_type, from_status, to_status, triggered_by, notes)
       VALUES ($1, 'BOOKING_RESCHEDULED', $2, 'rescheduled', $3, $4)`,
      [bookingId, booking.status, userId, `Rescheduled from slot ${booking.slot_id} to ${newSlotId}`]
    );

    await client.query('COMMIT');

    await AuditModel.log({
      userId, action: 'BOOKING_RESCHEDULED_BY_CUSTOMER',
      entityType: 'bookings', entityId: bookingId,
      oldValues: { slot_id: booking.slot_id, status: booking.status },
      newValues: { slot_id: newSlotId, status: 'rescheduled' },
      ip: req?.ip, userAgent: req?.headers?.['user-agent'],
    });

    return await BookingModel.findById(bookingId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { cancelBooking, rescheduleBooking };
