const ActivityModel = require('../models/activity.model');

const TYPES = {
  BOOKING_CREATED:    'booking_created',
  PAYMENT_COMPLETED:  'payment_completed',
  TEAM_CREATED:       'team_created',
  TEAM_JOINED:        'team_joined',
  MATCH_SCHEDULED:    'match_scheduled',
  REFERRAL_COMPLETED: 'referral_completed',
};

const log = (userId, activityType, description, entityId = null, entityType = null) =>
  ActivityModel.log(userId, activityType, description, entityId, entityType);

module.exports = { TYPES, log };
