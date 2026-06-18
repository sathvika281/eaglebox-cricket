const router = require('express').Router();

router.use('/health',   require('./health.routes'));
router.use('/auth',     require('./auth.routes'));
router.use('/slots',    require('./slot.routes'));
router.use('/bookings', require('./booking.routes'));

module.exports = router;
