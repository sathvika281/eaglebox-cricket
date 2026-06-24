const BookingService = require('../services/booking.service');
const BookingModel   = require('../models/booking.model');
const { generateQRDataURL } = require('../services/qr.service');
const R = require('../utils/response.utils');

const createBooking = async (req, res, next) => {
  try {
    const booking = await BookingService.createBooking(req.body, req.user.id, req);
    return R.created(res, { booking }, 'Booking created successfully');
  } catch (err) { next(err); }
};

const getMyBookings = async (req, res, next) => {
  try {
    const result = await BookingService.getMyBookings(req.user.id, req.query);
    return R.success(res, result);
  } catch (err) { next(err); }
};

const getAllBookings = async (req, res, next) => {
  try {
    const result = await BookingService.getAllBookings(req.query);
    return R.success(res, result);
  } catch (err) { next(err); }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await BookingService.updateBookingStatus(
      req.params.id, req.body.status, req.user.id, req
    );
    return R.success(res, { booking }, 'Booking status updated');
  } catch (err) { next(err); }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return R.notFound(res, 'Booking not found');
    if (booking.user_id !== req.user.id && req.user.role !== 'admin')
      return R.forbidden(res, 'Access denied');
    return R.success(res, { booking });
  } catch (err) { next(err); }
};

const getQR = async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return R.notFound(res, 'Booking not found');
    if (booking.user_id !== req.user.id) return R.forbidden(res, 'Access denied');
    if (!booking.verification_token) {
      return R.badRequest(res, 'QR not yet generated. Complete payment first.');
    }
    const qrDataURL = await generateQRDataURL(booking.verification_token);
    return R.success(res, { qr: qrDataURL, booking_ref: booking.booking_ref });
  } catch (err) { next(err); }
};

const verifyToken = async (req, res, next) => {
  try {
    const booking = await BookingModel.findByToken(req.params.token);
    if (!booking) {
      return res.status(404).json({ valid: false, message: 'Invalid or expired QR code' });
    }
    return res.json({
      valid: true,
      bookingId:    booking.id,
      bookingRef:   booking.booking_ref,
      customerName: booking.customer_name,
      slotDate:     booking.slot_date,
      slotTime:     `${booking.start_time} – ${booking.end_time}`,
      status:       booking.status,
    });
  } catch (err) { next(err); }
};

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus, getBookingById, getQR, verifyToken };
