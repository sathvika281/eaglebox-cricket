const PromoService = require('../services/promo.service');
const R = require('../utils/response.utils');

const validatePromo = async (req, res, next) => {
  try {
    const { code, booking_amount } = req.body;
    if (!code) return R.error(res, 'code is required', 400);
    const result = await PromoService.validate(code, req.user.id, parseFloat(booking_amount) || 0);
    return R.success(res, result);
  } catch(e) { next(e); }
};

const getAllCodes = async (req, res, next) => { try { const codes = await PromoService.getAllCodes(); return R.success(res, { codes }); } catch(e){next(e);} };
const createCode = async (req, res, next) => { try { const promo = await PromoService.createCode(req.body, req.user.id); return R.created(res, { promo }, 'Promo code created'); } catch(e){next(e);} };

module.exports = { validatePromo, getAllCodes, createCode };
