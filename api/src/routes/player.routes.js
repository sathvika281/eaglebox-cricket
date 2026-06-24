const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/player.controller');

// Private — authenticated routes
router.get('/profile',      authenticate, ctrl.getMyProfile);
router.patch('/profile',    authenticate, ctrl.updateProfile);
router.get('/stats',        authenticate, ctrl.getStats);
router.get('/achievements', authenticate, ctrl.getAchievements);
router.get('/activity',     authenticate, ctrl.getActivity);
router.get('/qr',           authenticate, ctrl.getQRCode);

// Public — no auth required (must come last to avoid matching above routes)
router.get('/:cricketId',   ctrl.getPublicProfile);

module.exports = router;
