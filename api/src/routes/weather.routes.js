const router = require('express').Router();
const ctrl   = require('../controllers/weather.controller');

router.get('/current',  ctrl.getCurrent);
router.get('/forecast', ctrl.getForecast);

module.exports = router;
