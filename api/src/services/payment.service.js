const Razorpay = require('razorpay');
const crypto   = require('crypto');
const PaymentModel       = require('../models/payment.model');
const BookingModel       = require('../models/booking.model');
const EmailService       = require('./email.service');
const { generateQRDataURL } = require('./qr.service');
const RewardService       = require('./reward.service');
const ReferralService     = require('./referral.service');
const NotificationService = require('./notification.service');
const ActivityService     = require('./activity.service');
const AchievementService  = require('./achievement.service');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (bookingId, userId) => {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404, expose: true });
  if (booking.user_id !== userId) throw Object.assign(new Error('Forbidden'), { statusCode: 403, expose: true });
  if (booking.status !== 'pending') {
    throw Object.assign(new Error('Only pending bookings can be paid'), { statusCode: 400, expose: true });
  }

  const order = await razorpay.orders.create({
    amount:   Math.round(parseFloat(booking.total_amount) * 100),
    currency: 'INR',
    receipt:  `${booking.booking_ref}`,
    notes:    { booking_id: bookingId, user_id: userId },
  });

  await PaymentModel.create({
    booking_id:        bookingId,
    user_id:           userId,
    razorpay_order_id: order.id,
    amount:            booking.total_amount,
  });

  return {
    order_id: order.id,
    amount:   order.amount,
    currency: order.currency,
    key_id:   process.env.RAZORPAY_KEY_ID,
    booking_ref: booking.booking_ref,
  };
};

const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw Object.assign(new Error('Payment verification failed: invalid signature'), { statusCode: 400, expose: true });
  }

  const payment = await PaymentModel.markPaid({ razorpay_order_id, razorpay_payment_id, razorpay_signature });

  // Fire-and-forget emails — never break the payment response
  const enriched = await BookingModel.findById(payment.booking_id);
  EmailService.sendPaymentSuccess({
    customerName:  enriched.customer_name,
    customerEmail: enriched.customer_email,
    bookingRef:    enriched.booking_ref,
    bookingId:     enriched.id,
    amount:        payment.amount,
    transactionId: payment.razorpay_payment_id,
    paidAt:        payment.paid_at,
  });

  // Fire-and-forget: earn reward points + referral completion + push notification + activity
  RewardService.earnForPayment(enriched.user_id, payment.amount, payment.booking_id).catch(() => {});
  ReferralService.completeReferralOnBooking(enriched.user_id).catch(() => {});
  ActivityService.log(enriched.user_id, ActivityService.TYPES.PAYMENT_COMPLETED,
    `Paid ₹${payment.amount} for booking ${enriched.booking_ref}`,
    payment.booking_id, 'booking').catch(() => {});
  AchievementService.checkAndAwardAll(enriched.user_id).catch(() => {});
  NotificationService.push(enriched.user_id, 'PAYMENT_SUCCESS', 'Payment Successful',
    `₹${payment.amount} paid for booking ${enriched.booking_ref}. Your slot is confirmed!`).catch(() => {});

  if (enriched.verification_token) {
    generateQRDataURL(enriched.verification_token).then((qrDataURL) => {
      EmailService.sendQRPass({
        customerName:  enriched.customer_name,
        customerEmail: enriched.customer_email,
        bookingRef:    enriched.booking_ref,
        bookingId:     enriched.id,
        slotDate:      enriched.slot_date,
        startTime:     enriched.start_time,
        endTime:       enriched.end_time,
        qrDataURL,
      });
    });
  }

  return payment;
};

const getMyPayments = async (userId) => {
  return PaymentModel.findByUserId(userId);
};

const getPaymentsByBooking = async (bookingId, userId) => {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404, expose: true });
  if (booking.user_id !== userId) throw Object.assign(new Error('Forbidden'), { statusCode: 403, expose: true });
  return PaymentModel.findByBookingId(bookingId);
};

const notifyPaymentFailed = async (bookingId, userId) => {
  const booking = await BookingModel.findById(bookingId);
  if (!booking || booking.user_id !== userId) return;
  EmailService.sendPaymentFailed({
    customerName:  booking.customer_name,
    customerEmail: booking.customer_email,
    bookingRef:    booking.booking_ref,
    bookingId:     booking.id,
    amount:        booking.total_amount,
  });
};

module.exports = { createOrder, verifyPayment, getMyPayments, getPaymentsByBooking, notifyPaymentFailed };
