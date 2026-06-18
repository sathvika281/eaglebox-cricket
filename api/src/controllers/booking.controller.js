const BookingService = require('../services/booking.service');
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

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus };
