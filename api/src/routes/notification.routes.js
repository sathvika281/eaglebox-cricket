const router = require('express').Router();
const ctrl   = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/',              authenticate, ctrl.getMyNotifications);
router.get('/unread-count',  authenticate, ctrl.getUnreadCount);
router.put('/:id/read',      authenticate, ctrl.markRead);
router.put('/read-all',      authenticate, ctrl.markAllRead);

module.exports = router;
