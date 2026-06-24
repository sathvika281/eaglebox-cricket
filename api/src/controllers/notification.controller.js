const NotificationService = require('../services/notification.service');
const R = require('../utils/response.utils');

const getMyNotifications = async (req, res, next) => { try { const data = await NotificationService.getMyNotifications(req.user.id, req.query); return R.success(res, data); } catch(e){next(e);} };
const getUnreadCount     = async (req, res, next) => { try { const count = await NotificationService.getUnreadCount(req.user.id); return R.success(res, { count }); } catch(e){next(e);} };
const markRead           = async (req, res, next) => { try { const n = await NotificationService.markRead(req.params.id, req.user.id); return R.success(res, { notification: n }, 'Marked as read'); } catch(e){next(e);} };
const markAllRead        = async (req, res, next) => { try { const r = await NotificationService.markAllRead(req.user.id); return R.success(res, r, 'All marked as read'); } catch(e){next(e);} };

module.exports = { getMyNotifications, getUnreadCount, markRead, markAllRead };
