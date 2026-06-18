const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/slots?date=2026-06-15
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date query parameter is required' });
    const [slots] = await db.query(
      `SELECT id, DATE_FORMAT(slot_date,'%Y-%m-%d') AS slot_date,
              start_time, end_time, price, status, created_at
       FROM slots WHERE slot_date = ? ORDER BY start_time`,
      [date]
    );
    res.json({ success: true, date, slots });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/slots/all - all slots with optional date filter
router.get('/all', async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = 'SELECT * FROM slots';
    const params = [];
    if (from && to) {
      query += ' WHERE slot_date BETWEEN ? AND ?';
      params.push(from, to);
    } else if (from) {
      query += ' WHERE slot_date >= ?';
      params.push(from);
    }
    query += ' ORDER BY slot_date, start_time';
    const [slots] = await db.query(query, params);
    res.json({ success: true, slots });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// POST /api/slots - admin creates a single slot
router.post('/', async (req, res) => {
  try {
    const { slot_date, start_time, end_time, price } = req.body;
    if (!slot_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'slot_date, start_time, end_time are required' });
    }
    const [result] = await db.query(
      'INSERT INTO slots (slot_date, start_time, end_time, price) VALUES (?, ?, ?, ?)',
      [slot_date, start_time, end_time, price || 500.00]
    );
    res.json({ success: true, slot_id: result.insertId, message: 'Slot created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// POST /api/slots/bulk - admin creates multiple slots for a date
router.post('/bulk', async (req, res) => {
  try {
    const { slot_date, time_slots, price } = req.body;
    if (!slot_date || !time_slots || !Array.isArray(time_slots)) {
      return res.status(400).json({ error: 'slot_date and time_slots array are required' });
    }
    const values = time_slots.map(t => [slot_date, t.start_time, t.end_time, price || 500.00]);
    await db.query('INSERT INTO slots (slot_date, start_time, end_time, price) VALUES ?', [values]);
    res.json({ success: true, created: values.length, message: `${values.length} slots created for ${slot_date}` });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// DELETE /api/slots/:id - admin deletes an available slot
router.delete('/:id', async (req, res) => {
  try {
    const [[slot]] = await db.query('SELECT * FROM slots WHERE id = ?', [req.params.id]);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.status === 'booked') return res.status(400).json({ error: 'Cannot delete a booked slot' });
    await db.query('DELETE FROM slots WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// PUT /api/slots/:id/block - admin blocks a slot
router.put('/:id/block', async (req, res) => {
  try {
    const [[slot]] = await db.query('SELECT * FROM slots WHERE id = ?', [req.params.id]);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.status === 'booked') return res.status(400).json({ error: 'Slot is already booked' });
    await db.query("UPDATE slots SET status = 'blocked' WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Slot blocked' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
