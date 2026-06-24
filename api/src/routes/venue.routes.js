const router = require('express').Router();
const ctrl   = require('../controllers/venue.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize }    = require('../middleware/rbac.middleware');

router.get('/',        ctrl.getVenues);
router.get('/default', ctrl.getDefault);
router.get('/:id',     ctrl.getVenue);
router.put('/:id',     authenticate, authorize('admin'), ctrl.updateVenue);

module.exports = router;
