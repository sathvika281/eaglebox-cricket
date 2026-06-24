const router = require('express').Router();
const ctrl   = require('../controllers/rental.controller');

router.get('/items', ctrl.getRentalItems);

module.exports = router;
