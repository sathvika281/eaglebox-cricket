const BookingModel = require('../models/booking.model');
const SlotModel    = require('../models/slot.model');
const AuditModel   = require('../models/audit.model');
const { paginate, paginatedResponse } = require('../utils/pagination.utils');

const VALID_TRANSITIONS = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const createBooking = async ({ slot_id, num_players, notes }, userId, req) => {
  const slot = await SlotModel.findById(slot_id);
  if (!slot) throw Object.assign(new Error('Slot not found'), { statusCode: 404, expose: true });

  if (slot.status !== 'available') {
    throw Object.assign(new Error('Slot is not available for booking'), { statusCode: 409, expose: true });
  }

  const today = new Date().toISOString().split('T')[0];
  if (slot.slot_date < today) {
    throw Object.assign(new Error('Cannot book a past slot'), { statusCode: 400, expose: true });
  }

  const alreadyBooked = await BookingModel.isSlotBooked(slot_id);
  if (alreadyBooked) {
    throw Object.assign(new Error('Slot has already been booked'), { statusCode: 409, expose: true });
  }

  const booking = await BookingModel.create({
    user_id: userId,
    slot_id,
    num_players,
    total_amount: slot.price,
    notes,
  });

  await AuditModel.log({
    userId, action: 'BOOKING_CREATED',
    entityType: 'bookings', entityId: booking.id,
    newValues: { booking_ref: booking.booking_ref, slot_id, num_players, total_amount: slot.price },
    ip: req?.ip, userAgent: req?.headers?.['user-agent'],
  });

  return booking;
};

const getMyBookings = async (userId, queryParams) => {
  const { page, limit } = paginate(queryParams);
  const { status } = queryParams;
  const { data, total } = await BookingModel.findAll({ userId, status, page, limit });
  return paginatedResponse(data, total, page, limit);
};

const getAllBookings = async (queryParams) => {
  const { page, limit } = paginate(queryParams);
  const { status, search } = queryParams;
  const { data, total } = await BookingModel.findAll({ status, search, page, limit });
  return paginatedResponse(data, total, page, limit);
};

const updateBookingStatus = async (bookingId, status, adminId, req) => {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404, expose: true });

  const allowed = VALID_TRANSITIONS[booking.status];
  if (!allowed.includes(status)) {
    throw Object.assign(
      new Error(`Cannot transition from '${booking.status}' to '${status}'`),
      { statusCode: 400, expose: true }
    );
  }

  const updated = await BookingModel.updateStatus(
    bookingId, status, adminId,
    `Status changed from ${booking.status} to ${status} by admin`
  );

  await AuditModel.log({
    userId: adminId, action: 'BOOKING_STATUS_UPDATED',
    entityType: 'bookings', entityId: bookingId,
    oldValues: { status: booking.status }, newValues: { status },
    ip: req?.ip, userAgent: req?.headers?.['user-agent'],
  });

  return updated;
};

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus };
