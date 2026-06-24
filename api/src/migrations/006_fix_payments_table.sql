-- Migration 006: Replace payments table with Razorpay-compatible schema
-- The original 001 schema had payment_type NOT NULL and wrong status values.
-- Drop and recreate with the correct structure.

DROP TABLE IF EXISTS payments CASCADE;

CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          UUID NOT NULL REFERENCES bookings(id),
  user_id             UUID NOT NULL REFERENCES users(id),
  razorpay_order_id   VARCHAR(255) NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR(255),
  razorpay_signature  TEXT,
  amount              NUMERIC(10,2) NOT NULL,
  currency            VARCHAR(10)   NOT NULL DEFAULT 'INR',
  status              VARCHAR(20)   NOT NULL DEFAULT 'created'
                        CHECK (status IN ('created','paid','failed')),
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user    ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order   ON payments(razorpay_order_id);
