const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/reports/revenue - daily revenue summary
router.get('/revenue', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(s.slot_date,'%Y-%m-%d') AS date,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN s.price ELSE 0 END), 0) as confirmed_revenue,
        COALESCE(SUM(CASE WHEN b.status = 'pending'   THEN s.price ELSE 0 END), 0) as pending_revenue
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      GROUP BY s.slot_date
      ORDER BY s.slot_date DESC
      LIMIT 30
    `);
    res.json({ success: true, revenue: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/reports/occupancy - slot occupancy stats
router.get('/occupancy', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        slot_date,
        COUNT(*) as total_slots,
        SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked_slots,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_slots,
        ROUND(SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) as occupancy_percent
      FROM slots
      GROUP BY slot_date
      ORDER BY slot_date DESC
      LIMIT 30
    `);
    res.json({ success: true, occupancy: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/reports/summary - full business summary
router.get('/summary', async (req, res) => {
  try {
    const [[bookings]] = await db.query(`
      SELECT
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status='confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status='pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status='cancelled' THEN 1 END) as cancelled
      FROM bookings
    `);
    const [[slots]] = await db.query(`
      SELECT
        COUNT(*) as total_slots,
        COUNT(CASE WHEN status='available' THEN 1 END) as available,
        COUNT(CASE WHEN status='booked' THEN 1 END) as booked
      FROM slots
    `);
    const [[revenue]] = await db.query(`
      SELECT COALESCE(SUM(s.price), 0) as total_revenue
      FROM bookings b JOIN slots s ON b.slot_id = s.id
      WHERE b.status = 'confirmed'
    `);
    const [recent] = await db.query(`
      SELECT b.booking_id, b.customer_name, b.phone, b.status, s.slot_date, s.start_time
      FROM bookings b JOIN slots s ON b.slot_id = s.id
      ORDER BY b.created_at DESC LIMIT 5
    `);
    res.json({
      success: true,
      summary: { ...bookings, ...slots, total_revenue: revenue.total_revenue },
      recent_bookings: recent
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/reports/alerts - pending bookings older than 2 hours
router.get('/alerts', async (req, res) => {
  try {
    const [pending] = await db.query(`
      SELECT b.id, b.booking_id, b.customer_name, b.phone, b.status,
             s.slot_date, s.start_time, b.created_at,
             TIMESTAMPDIFF(MINUTE, b.created_at, NOW()) as minutes_waiting
      FROM bookings b JOIN slots s ON b.slot_id = s.id
      WHERE b.status = 'pending'
      ORDER BY b.created_at ASC
    `);
    const alerts = pending.map(b => ({ ...b, urgent: b.minutes_waiting > 120 }));
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
