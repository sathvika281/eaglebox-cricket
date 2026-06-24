const RentalService = require('../services/rental.service');
const R = require('../utils/response.utils');

const getRentalItems = async (req, res, next) => { try { const items = await RentalService.getRentalItems(); return R.success(res, { items }); } catch(e){next(e);} };

module.exports = { getRentalItems };
