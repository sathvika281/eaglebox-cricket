ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS verification_token VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS qr_generated_at   TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_bookings_verification_token ON bookings(verification_token);
