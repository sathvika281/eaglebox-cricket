const { query } = require('../config/database');

const findAllItems = async () => {
  const { rows } = await query(`SELECT * FROM rental_items WHERE is_available = TRUE ORDER BY name`);
  return rows;
};

const findItemById = async (id) => {
  const { rows } = await query(`SELECT * FROM rental_items WHERE id = $1`, [id]);
  return rows[0] || null;
};

const findByBooking = async (bookingId) => {
  const { rows } = await query(
    `SELECT br.*, ri.name, ri.icon
     FROM booking_rentals br
     JOIN rental_items ri ON ri.id = br.rental_item_id
     WHERE br.booking_id = $1`,
    [bookingId]
  );
  return rows;
};

const addToBooking = async (bookingId, items) => {
  const results = [];
  for (const { rental_item_id, quantity } of items) {
    const item = await findItemById(rental_item_id);
    if (!item) continue;
    const unitPrice = item.price;
    const totalPrice = unitPrice * quantity;
    const { rows: [r] } = await query(
      `INSERT INTO booking_rentals (booking_id, rental_item_id, quantity, unit_price, total_price)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [bookingId, rental_item_id, quantity, unitPrice, totalPrice]
    );
    results.push(r);
  }
  return results;
};

module.exports = { findAllItems, findItemById, findByBooking, addToBooking };
