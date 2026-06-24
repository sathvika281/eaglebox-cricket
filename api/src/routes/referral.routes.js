const router = require('express').Router();
const ctrl   = require('../controllers/referral.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, ctrl.getMyReferrals);

module.exports = router;
