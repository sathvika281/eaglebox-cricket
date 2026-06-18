const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'pending'   THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM bookings
    `);
    const [[slotStats]] = await db.query(`
      SELECT
        COUNT(*) as total_slots,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_slots
      FROM slots
    `);
    res.json({ success: true, dashboard: { ...stats, ...slotStats } });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
