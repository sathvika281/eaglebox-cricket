const PromoModel = require('../models/promo.model');

const validate = async (code, userId, bookingAmount) => {
  const promo = await PromoModel.findByCode(code);
  if (!promo) throw Object.assign(new Error('Invalid promo code'), { statusCode: 404, expose: true });

  const now = new Date();
  if (promo.valid_from && new Date(promo.valid_from) > now)
    throw Object.assign(new Error('This promo code is not active yet'), { statusCode: 400, expose: true });
  if (promo.valid_until && new Date(promo.valid_until) < now)
    throw Object.assign(new Error('This promo code has expired'), { statusCode: 400, expose: true });
  if (promo.usage_limit && promo.usage_count >= promo.usage_limit)
    throw Object.assign(new Error('This promo code has reached its usage limit'), { statusCode: 400, expose: true });
  if (bookingAmount < promo.min_booking_amount)
    throw Object.assign(new Error(`Minimum booking amount of ₹${promo.min_booking_amount} required`), { statusCode: 400, expose: true });

  const userCount = await PromoModel.getUserUsageCount(promo.id, userId);
  if (userCount >= promo.user_limit)
    throw Object.assign(new Error('You have already used this promo code'), { statusCode: 400, expose: true });

  let discount = promo.discount_type === 'percentage'
    ? (bookingAmount * promo.discount_value) / 100
    : promo.discount_value;

  if (promo.max_discount_amount) discount = Math.min(discount, promo.max_discount_amount);
  discount = Math.min(discount, bookingAmount);

  return {
    promo_id:     promo.id,
    code:         promo.code,
    description:  promo.description,
    discount_type: promo.discount_type,
    discount_value: promo.discount_value,
    discount_amount: Math.round(discount * 100) / 100,
    final_amount: Math.round((bookingAmount - discount) * 100) / 100,
  };
};

const apply = async (promoId, userId, bookingId, discountApplied) =>
  PromoModel.recordUsage({ promoId, userId, bookingId, discountApplied });

const getAllCodes = async () => PromoModel.findAll();

const createCode = async (body, userId) => PromoModel.create({ ...body, created_by: userId });

module.exports = { validate, apply, getAllCodes, createCode };
