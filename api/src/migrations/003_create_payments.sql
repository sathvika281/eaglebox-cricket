CREATE TABLE IF NOT EXISTS payments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id           UUID NOT NULL REFERENCES bookings(id),
  user_id              UUID NOT NULL REFERENCES users(id),
  razorpay_order_id    VARCHAR(255) NOT NULL UNIQUE,
  razorpay_payment_id  VARCHAR(255),
  razorpay_signature   TEXT,
  amount               NUMERIC(10,2) NOT NULL,
  currency             VARCHAR(10) NOT NULL DEFAULT 'INR',
  status               VARCHAR(20) NOT NULL DEFAULT 'created'
                         CHECK (status IN ('created','paid','failed')),
  paid_at              TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id    ON payments(user_id);
