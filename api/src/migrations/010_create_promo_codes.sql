-- Migration 010: Promo code system
CREATE TABLE IF NOT EXISTS promo_codes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                VARCHAR(50)    NOT NULL UNIQUE,
  description         TEXT,
  discount_type       VARCHAR(20)    NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value      NUMERIC(10,2)  NOT NULL,
  min_booking_amount  NUMERIC(10,2)  NOT NULL DEFAULT 0,
  max_discount_amount NUMERIC(10,2),
  usage_limit         INT,
  usage_count         INT            NOT NULL DEFAULT 0,
  user_limit          INT            NOT NULL DEFAULT 1,
  valid_from          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  valid_until         TIMESTAMPTZ,
  is_active           BOOLEAN        NOT NULL DEFAULT TRUE,
  created_by          UUID           REFERENCES users(id),
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promo_usage (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id         UUID           NOT NULL REFERENCES promo_codes(id),
  user_id          UUID           NOT NULL REFERENCES users(id),
  booking_id       UUID           REFERENCES bookings(id),
  discount_applied NUMERIC(10,2)  NOT NULL,
  used_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_code  ON promo_codes (code) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_promo_usage ON promo_usage (promo_id, user_id);

-- Seed demo promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_booking_amount, max_discount_amount, usage_limit, user_limit, valid_until)
VALUES
  ('WELCOME50', 'Welcome offer — 50% off your first booking', 'percentage', 50, 0, 400, 100, 1, NOW() + INTERVAL '1 year'),
  ('CRICKET10', 'Flat ₹10 off on any booking', 'fixed', 10, 0, NULL, 500, 5, NOW() + INTERVAL '1 year'),
  ('SUMMER100', 'Summer special — ₹100 off', 'fixed', 100, 500, NULL, 200, 2, NOW() + INTERVAL '6 months')
ON CONFLICT (code) DO NOTHING;
