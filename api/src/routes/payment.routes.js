const router = require('express').Router();
const Joi    = require('joi');
const ctrl   = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate }     = require('../middleware/validate.middleware');

const verifySchema = Joi.object({
  razorpay_order_id:   Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature:  Joi.string().required(),
});

router.post('/bookings/:bookingId/create-order', authenticate, ctrl.createOrder);
router.post('/verify',                           authenticate, validate(verifySchema), ctrl.verifyPayment);
router.get('/mine',                              authenticate, ctrl.getMyPayments);
router.get('/bookings/:bookingId',               authenticate, ctrl.getPaymentsByBooking);
router.post('/bookings/:bookingId/notify-failed', authenticate, ctrl.notifyFailed);

module.exports = router;
