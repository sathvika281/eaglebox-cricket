const PaymentService = require('../services/payment.service');
const R = require('../utils/response.utils');

const createOrder = async (req, res, next) => {
  try {
    const data = await PaymentService.createOrder(req.params.bookingId, req.user.id);
    return R.success(res, { data }, 'Razorpay order created');
  } catch (err) { next(err); }
};

const verifyPayment = async (req, res, next) => {
  try {
    const payment = await PaymentService.verifyPayment(req.body);
    return R.success(res, { payment }, 'Payment verified and booking confirmed');
  } catch (err) { next(err); }
};

const getMyPayments = async (req, res, next) => {
  try {
    const payments = await PaymentService.getMyPayments(req.user.id);
    return R.success(res, { payments });
  } catch (err) { next(err); }
};

const getPaymentsByBooking = async (req, res, next) => {
  try {
    const payments = await PaymentService.getPaymentsByBooking(req.params.bookingId, req.user.id);
    return R.success(res, { payments });
  } catch (err) { next(err); }
};

const notifyFailed = async (req, res, next) => {
  try {
    await PaymentService.notifyPaymentFailed(req.params.bookingId, req.user.id);
    return R.success(res, {}, 'Notification sent');
  } catch (err) { next(err); }
};

module.exports = { createOrder, verifyPayment, getMyPayments, getPaymentsByBooking, notifyFailed };
