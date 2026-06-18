const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/tournaments - list all tournaments
router.get('/', async (req, res) => {
  try {
    const [tournaments] = await db.query(
      'SELECT * FROM tournaments ORDER BY start_date DESC'
    );
    res.json({ success: true, tournaments });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// POST /api/tournaments - admin creates tournament
router.post('/', async (req, res) => {
  try {
    const { name, start_date, end_date, entry_fee, max_teams } = req.body;
    if (!name || !start_date || !end_date) {
      return res.status(400).json({ error: 'name, start_date, end_date are required' });
    }
    const [result] = await db.query(
      'INSERT INTO tournaments (name, start_date, end_date, entry_fee, max_teams) VALUES (?, ?, ?, ?, ?)',
      [name, start_date, end_date, entry_fee || 0, max_teams || 8]
    );
    res.json({ success: true, tournament_id: result.insertId, message: 'Tournament created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// POST /api/tournaments/:id/register - team registers for tournament
router.post('/:id/register', async (req, res) => {
  try {
    const { team_name, captain_name, phone, num_players } = req.body;
    const tournament_id = req.params.id;

    if (!team_name || !captain_name || !phone) {
      return res.status(400).json({ error: 'team_name, captain_name, and phone are required' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be 10 digits' });
    }

    const [[tournament]] = await db.query('SELECT * FROM tournaments WHERE id = ?', [tournament_id]);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.status === 'completed') return res.status(400).json({ error: 'Tournament already completed' });

    const [[{ count }]] = await db.query(
      'SELECT COUNT(*) as count FROM tournament_registrations WHERE tournament_id = ?',
      [tournament_id]
    );
    if (count >= tournament.max_teams) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    const [result] = await db.query(
      'INSERT INTO tournament_registrations (tournament_id, team_name, captain_name, phone, num_players) VALUES (?, ?, ?, ?, ?)',
      [tournament_id, team_name, captain_name, phone, num_players || 6]
    );
    res.json({
      success: true,
      registration_id: result.insertId,
      message: `Team "${team_name}" registered for ${tournament.name}`,
      tournament: tournament.name,
      entry_fee: tournament.entry_fee
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/tournaments/:id/teams - list registered teams
router.get('/:id/teams', async (req, res) => {
  try {
    const [teams] = await db.query(
      'SELECT * FROM tournament_registrations WHERE tournament_id = ? ORDER BY created_at',
      [req.params.id]
    );
    res.json({ success: true, teams });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
