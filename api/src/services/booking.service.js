const BookingModel       = require('../models/booking.model');
const SlotModel          = require('../models/slot.model');
const AuditModel         = require('../models/audit.model');
const { paginate, paginatedResponse } = require('../utils/pagination.utils');
const EmailService       = require('./email.service');
const PromoService       = require('./promo.service');
const RentalService      = require('./rental.service');
const ActivityService    = require('./activity.service');
const AchievementService = require('./achievement.service');

const VALID_TRANSITIONS = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const createBooking = async ({ slot_id, num_players, notes, promo_code, rental_items }, userId, req) => {
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

  let totalAmount  = parseFloat(slot.price);
  let rentalTotal  = 0;
  let promoData    = null;
  let promoDiscount = 0;

  if (rental_items && rental_items.length > 0) {
    rentalTotal = await RentalService.calcRentalTotal(rental_items);
    totalAmount += rentalTotal;
  }

  if (promo_code) {
    promoData     = await PromoService.validate(promo_code, userId, totalAmount);
    promoDiscount = promoData.discount_amount;
    totalAmount   = Math.max(totalAmount - promoDiscount, 0);
  }

  const booking = await BookingModel.create({
    user_id: userId,
    slot_id,
    num_players,
    total_amount: Math.round(totalAmount * 100) / 100,
    notes,
  });

  if (rental_items && rental_items.length > 0) {
    await RentalService.addRentalsToBooking(booking.id, rental_items);
  }

  if (promoData) {
    await PromoService.apply(promoData.promo_id, userId, booking.id, promoDiscount);
  }

  await AuditModel.log({
    userId, action: 'BOOKING_CREATED',
    entityType: 'bookings', entityId: booking.id,
    newValues: { booking_ref: booking.booking_ref, slot_id, num_players, total_amount: booking.total_amount, promo_code: promo_code || null },
    ip: req?.ip, userAgent: req?.headers?.['user-agent'],
  });

  // Fire-and-forget: activity log + achievement check
  ActivityService.log(userId, ActivityService.TYPES.BOOKING_CREATED,
    `Booked a slot (${booking.booking_ref})`, booking.id, 'booking').catch(() => {});
  AchievementService.checkAndAwardAll(userId).catch(() => {});

  // Fire-and-forget — email failure must never break booking flow
  const enriched = await BookingModel.findById(booking.id);
  EmailService.sendBookingConfirmation({
    customerName:  enriched.customer_name,
    customerEmail: enriched.customer_email,
    bookingRef:    enriched.booking_ref,
    slotDate:      enriched.slot_date,
    startTime:     enriched.start_time,
    endTime:       enriched.end_time,
    numPlayers:    enriched.num_players,
    amount:        enriched.total_amount,
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

  if (status === 'cancelled') {
    const enriched = await BookingModel.findById(bookingId);
    EmailService.sendBookingCancellation({
      customerName:  enriched.customer_name,
      customerEmail: enriched.customer_email,
      bookingRef:    enriched.booking_ref,
      slotDate:      enriched.slot_date,
      startTime:     enriched.start_time,
      endTime:       enriched.end_time,
      amount:        enriched.total_amount,
    });
  }

  return updated;
};

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus };
