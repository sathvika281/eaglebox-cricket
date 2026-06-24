const BookingManagementService = require('../services/booking-management.service');
const R = require('../utils/response.utils');

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await BookingManagementService.cancelBooking(req.params.id, req.user.id, req);
    return R.success(res, { booking }, 'Booking cancelled successfully');
  } catch (err) { next(err); }
};

const rescheduleBooking = async (req, res, next) => {
  try {
    const { newSlotId } = req.body;
    if (!newSlotId) return R.error(res, 'newSlotId is required', 400);
    const booking = await BookingManagementService.rescheduleBooking(req.params.id, newSlotId, req.user.id, req);
    return R.success(res, { booking }, 'Booking rescheduled successfully');
  } catch (err) { next(err); }
};

module.exports = { cancelBooking, rescheduleBooking };
