-- Migration 013: Equipment rental system
CREATE TABLE IF NOT EXISTS rental_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100)   NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2)  NOT NULL,
  icon         VARCHAR(50),
  is_available BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_rentals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID           NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rental_item_id UUID           NOT NULL REFERENCES rental_items(id),
  quantity       INT            NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price     NUMERIC(10,2)  NOT NULL,
  total_price    NUMERIC(10,2)  NOT NULL,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_rentals_booking ON booking_rentals (booking_id);

-- Seed rental items
INSERT INTO rental_items (name, description, price, icon)
VALUES
  ('Cricket Bat',   'Full size cricket bat (MRF/SG)', 50, 'sports_cricket'),
  ('Cricket Ball',  'Leather ball (set of 2)',         30, 'sports_baseball'),
  ('Stumps Set',    'Full stumps set with bails',      40, 'fence'),
  ('Jersey Set',    'Team jersey set (11 pcs)',        100, 'shirt')
ON CONFLICT DO NOTHING;
