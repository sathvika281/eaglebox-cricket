const NotificationModel = require('../models/notification.model');

const push = async (userId, type, subject, message) => {
  try {
    return await NotificationModel.create({ userId, type, subject, message, channel: 'in_app' });
  } catch (err) {
    console.error('Notification push error:', err.message);
    return null;
  }
};

const getMyNotifications = async (userId, query) => NotificationModel.findByUser(userId, query);

const getUnreadCount = async (userId) => NotificationModel.unreadCount(userId);

const markRead = async (id, userId) => {
  const n = await NotificationModel.markRead(id, userId);
  if (!n) throw Object.assign(new Error('Notification not found'), { statusCode: 404, expose: true });
  return n;
};

const markAllRead = async (userId) => {
  const count = await NotificationModel.markAllRead(userId);
  return { updated: count };
};

module.exports = { push, getMyNotifications, getUnreadCount, markRead, markAllRead };
