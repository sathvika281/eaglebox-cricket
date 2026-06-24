const VenueService = require('../services/venue.service');
const R = require('../utils/response.utils');

const getVenues  = async (req, res, next) => { try { const venues = await VenueService.getVenues(); return R.success(res, { venues }); } catch(e){next(e);} };
const getVenue   = async (req, res, next) => { try { const venue  = await VenueService.getVenue(req.params.id); return R.success(res, { venue }); } catch(e){next(e);} };
const getDefault = async (req, res, next) => { try { const venue  = await VenueService.getVenue(null); return R.success(res, { venue }); } catch(e){next(e);} };
const updateVenue= async (req, res, next) => { try { const venue  = await VenueService.updateVenue(req.params.id, req.body); return R.success(res, { venue }, 'Venue updated'); } catch(e){next(e);} };

module.exports = { getVenues, getVenue, getDefault, updateVenue };
