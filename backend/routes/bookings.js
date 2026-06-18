const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/bookings - create a new booking
router.post('/', async (req, res) => {
  try {
    const { customer_name, phone, email, slot_id, num_players, booking_type } = req.body;

    if (!customer_name || !phone || !slot_id) {
      return res.status(400).json({ error: 'customer_name, phone, and slot_id are required' });
    }

    const [slot] = await db.query(
      "SELECT * FROM slots WHERE id = ? AND status = 'available'", [slot_id]
    );
    if (slot.length === 0) {
      return res.status(400).json({ error: 'Slot is not available or does not exist' });
    }

    const booking_id = 'EBC' + Date.now();

    await db.query(
      `INSERT INTO bookings (booking_id, customer_name, phone, email, slot_id, num_players, booking_type, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [booking_id, customer_name, phone, email || '', slot_id, num_players || 1, booking_type || 'regular']
    );

    await db.query("UPDATE slots SET status = 'booked' WHERE id = ?", [slot_id]);

    res.status(201).json({ success: true, booking_id });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/bookings/:phone - customer looks up their bookings
router.get('/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const [bookings] = await db.query(
      `SELECT b.id, b.booking_id, b.customer_name, b.phone, b.email,
              b.num_players, b.booking_type, b.status, b.created_at,
              DATE_FORMAT(s.slot_date,'%Y-%m-%d') AS slot_date,
              s.start_time, s.end_time
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       WHERE b.phone = ?
       ORDER BY b.created_at DESC`,
      [phone]
    );
    res.json({ success: true, phone, bookings });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/bookings - all bookings (admin)
router.get('/', async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = `
      SELECT b.id, b.booking_id, b.customer_name, b.phone, b.email,
             b.num_players, b.booking_type, b.status, b.created_at,
             DATE_FORMAT(s.slot_date,'%Y-%m-%d') AS slot_date,
             s.start_time, s.end_time
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      WHERE 1=1`;
    const params = [];

    if (status) { query += ' AND b.status = ?'; params.push(status); }
    if (date)   { query += ' AND s.slot_date = ?'; params.push(date); }

    query += ' ORDER BY b.created_at DESC';

    const [bookings] = await db.query(query, params);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// PUT /api/bookings/:booking_id/status - update status (admin)
router.put('/:booking_id/status', async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { status } = req.body;

    const allowed = ['pending', 'confirmed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [rows] = await db.query(
      'SELECT id, slot_id FROM bookings WHERE booking_id = ?', [booking_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await db.query('UPDATE bookings SET status = ? WHERE booking_id = ?', [status, booking_id]);

    if (status === 'cancelled') {
      await db.query("UPDATE slots SET status = 'available' WHERE id = ?", [rows[0].slot_id]);
    }

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
