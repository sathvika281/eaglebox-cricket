-- Migration 009: Venue information system
CREATE TABLE IF NOT EXISTS venues (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(200)   NOT NULL,
  description      TEXT,
  address          TEXT           NOT NULL,
  city             VARCHAR(100)   NOT NULL DEFAULT 'Hyderabad',
  state            VARCHAR(100)   NOT NULL DEFAULT 'Telangana',
  pincode          VARCHAR(10),
  latitude         NUMERIC(10,7),
  longitude        NUMERIC(10,7),
  phone            VARCHAR(15),
  email            VARCHAR(255),
  operating_hours  JSONB          NOT NULL DEFAULT '{}',
  facilities       JSONB          NOT NULL DEFAULT '[]',
  rules            TEXT,
  photos           JSONB          NOT NULL DEFAULT '[]',
  google_maps_url  VARCHAR(500),
  is_active        BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

INSERT INTO venues (name, description, address, city, state, pincode, phone, email, operating_hours, facilities, rules, photos, google_maps_url)
VALUES (
  'Eagle Box Cricket — Main Arena',
  'Hyderabad''s premier box cricket venue with floodlit pitches, premium turf, and state-of-the-art facilities for an unmatched cricket experience.',
  'Main Arena, Hyderabad',
  'Hyderabad',
  'Telangana',
  '500001',
  '+91 9000000000',
  'contact@eagleboxcricket.com',
  '{"monday":{"open":"06:00","close":"22:00"},"tuesday":{"open":"06:00","close":"22:00"},"wednesday":{"open":"06:00","close":"22:00"},"thursday":{"open":"06:00","close":"22:00"},"friday":{"open":"06:00","close":"22:00"},"saturday":{"open":"06:00","close":"23:00"},"sunday":{"open":"06:00","close":"23:00"}}',
  '["Floodlit Pitches","Premium Turf","Parking","Changing Rooms","Drinking Water","First Aid","Score Board","Seating Area"]',
  'No metal spikes allowed. Proper cricket attire required. No outside food or beverages. Booking confirmation required for entry. Players must arrive 10 minutes before slot start.',
  '[]',
  'https://maps.google.com'
)
ON CONFLICT DO NOTHING;
