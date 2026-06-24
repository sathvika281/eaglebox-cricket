const router = require('express').Router();
const ctrl   = require('../controllers/leaderboard.controller');

// All leaderboard endpoints are public
router.get('/teams',   ctrl.getTeams);
router.get('/players', ctrl.getPlayers);
router.get('/rewards', ctrl.getRewards);

// Public team profile (no auth required)
router.get('/team/:id', ctrl.getPublicTeam);

module.exports = router;
