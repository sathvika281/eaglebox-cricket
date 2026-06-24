-- Migration 007: Booking cancellation & rescheduling support
-- Add rescheduled status + tracking columns

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'));

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS original_slot_id  UUID REFERENCES slots(id),
  ADD COLUMN IF NOT EXISTS reschedule_count  INT NOT NULL DEFAULT 0;
