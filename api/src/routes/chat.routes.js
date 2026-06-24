const router = require('express').Router();
const ctrl   = require('../controllers/chat.controller');

router.post('/', ctrl.chat);

module.exports = router;
