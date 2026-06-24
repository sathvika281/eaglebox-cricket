const RentalModel = require('../models/rental.model');

const getRentalItems = async () => RentalModel.findAllItems();

const getBookingRentals = async (bookingId) => RentalModel.findByBooking(bookingId);

const addRentalsToBooking = async (bookingId, items) => {
  if (!items || !items.length) return [];
  return RentalModel.addToBooking(bookingId, items);
};

const calcRentalTotal = async (items) => {
  let total = 0;
  for (const { rental_item_id, quantity } of items) {
    const item = await RentalModel.findItemById(rental_item_id);
    if (item) total += item.price * quantity;
  }
  return total;
};

module.exports = { getRentalItems, getBookingRentals, addRentalsToBooking, calcRentalTotal };
