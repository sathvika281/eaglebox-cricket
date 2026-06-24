const VenueModel = require('../models/venue.model');

const getVenues = async () => VenueModel.findAll();

const getVenue = async (id) => {
  const venue = await (id ? VenueModel.findById(id) : VenueModel.findFirst());
  if (!venue) throw Object.assign(new Error('Venue not found'), { statusCode: 404, expose: true });
  return venue;
};

const updateVenue = async (id, body) => {
  const venue = await VenueModel.update(id, body);
  if (!venue) throw Object.assign(new Error('Venue not found'), { statusCode: 404, expose: true });
  return venue;
};

module.exports = { getVenues, getVenue, updateVenue };
