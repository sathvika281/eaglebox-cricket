const router = require('express').Router();
const ctrl   = require('../controllers/reward.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/',        authenticate, ctrl.getMyRewards);
router.get('/balance', authenticate, ctrl.getBalance);

module.exports = router;
