-- Migration 014: Add in_app channel to notifications + is_read flag
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_channel_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_channel_check
    CHECK (channel IN ('email', 'sms', 'push', 'in_app'));

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id) WHERE is_read = FALSE;
