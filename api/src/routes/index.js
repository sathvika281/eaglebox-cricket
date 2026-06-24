const router = require('express').Router();

router.use('/health',        require('./health.routes'));
router.use('/auth',          require('./auth.routes'));
router.use('/slots',         require('./slot.routes'));
router.use('/bookings',      require('./booking.routes'));
router.use('/payments',      require('./payment.routes'));
router.use('/chat',          require('./chat.routes'));
router.use('/teams',         require('./team.routes'));
router.use('/venues',        require('./venue.routes'));
router.use('/promos',        require('./promo.routes'));
router.use('/rewards',       require('./reward.routes'));
router.use('/matches',       require('./match.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/rentals',       require('./rental.routes'));
router.use('/referrals',     require('./referral.routes'));
router.use('/upload',        require('./upload.routes'));
router.use('/leaderboard',   require('./leaderboard.routes'));
router.use('/weather',       require('./weather.routes'));
router.use('/player',        require('./player.routes'));
router.use('/matches/:matchId/photos', require('./gallery.routes'));
router.get('/gallery', require('../middleware/auth.middleware').authenticate, require('../controllers/gallery.controller').getAllPhotos);

module.exports = router;
