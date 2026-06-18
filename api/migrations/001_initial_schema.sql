-- ============================================================
-- Eagle Box Cricket — Initial Schema
-- Migration: 001
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(100)  NOT NULL,
  email          VARCHAR(255)  NOT NULL UNIQUE,
  phone          VARCHAR(15)   NOT NULL UNIQUE,
  password_hash  VARCHAR(255)  NOT NULL,
  role           VARCHAR(20)   NOT NULL DEFAULT 'customer'
                   CHECK (role IN ('admin', 'customer')),
  is_verified    BOOLEAN       NOT NULL DEFAULT FALSE,
  is_deleted     BOOLEAN       NOT NULL DEFAULT FALSE,
  deleted_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMPTZ  NOT NULL,
  is_revoked  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SLOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date   DATE          NOT NULL,
  start_time  TIME          NOT NULL,
  end_time    TIME          NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  status      VARCHAR(20)   NOT NULL DEFAULT 'available'
                CHECK (status IN ('available', 'booked', 'blocked')),
  created_by  UUID          REFERENCES users(id),
  is_deleted  BOOLEAN       NOT NULL DEFAULT FALSE,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (slot_date, start_time)
);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref    VARCHAR(20)   NOT NULL UNIQUE,
  user_id        UUID          NOT NULL REFERENCES users(id),
  slot_id        UUID          NOT NULL REFERENCES slots(id),
  num_players    INT           NOT NULL DEFAULT 6 CHECK (num_players BETWEEN 1 AND 22),
  status         VARCHAR(20)   NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status VARCHAR(20)   NOT NULL DEFAULT 'unpaid'
                   CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  total_amount   NUMERIC(10,2) NOT NULL,
  notes          TEXT,
  is_deleted     BOOLEAN       NOT NULL DEFAULT FALSE,
  deleted_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BOOKING EVENTS (lifecycle tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   UUID         NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  event_type   VARCHAR(50)  NOT NULL,
  from_status  VARCHAR(20),
  to_status    VARCHAR(20),
  triggered_by UUID         REFERENCES users(id),
  notes        TEXT,
  metadata     JSONB,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TOURNAMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS tournaments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(200)  NOT NULL,
  description TEXT,
  start_date  DATE          NOT NULL,
  end_date    DATE          NOT NULL,
  entry_fee   NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_teams   INT           NOT NULL DEFAULT 8,
  prize_pool  NUMERIC(10,2) NOT NULL DEFAULT 0,
  status      VARCHAR(20)   NOT NULL DEFAULT 'upcoming'
                CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by  UUID          REFERENCES users(id),
  is_deleted  BOOLEAN       NOT NULL DEFAULT FALSE,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name       VARCHAR(100) NOT NULL,
  captain_name    VARCHAR(100) NOT NULL,
  captain_phone   VARCHAR(15)  NOT NULL,
  captain_email   VARCHAR(255),
  num_players     INT          NOT NULL DEFAULT 6,
  registered_by   UUID         REFERENCES users(id),
  is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TEAM REGISTRATIONS (teams <-> tournaments, many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS team_registrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         UUID         NOT NULL REFERENCES teams(id),
  tournament_id   UUID         NOT NULL REFERENCES tournaments(id),
  status          VARCHAR(20)  NOT NULL DEFAULT 'registered'
                    CHECK (status IN ('registered', 'approved', 'eliminated', 'winner')),
  payment_status  VARCHAR(20)  NOT NULL DEFAULT 'unpaid'
                    CHECK (payment_status IN ('unpaid', 'paid')),
  registered_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, tournament_id)
);

-- ============================================================
-- MEMBERSHIPS (plans)
-- ============================================================
CREATE TABLE IF NOT EXISTS memberships (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name        VARCHAR(100)  NOT NULL,
  price            NUMERIC(10,2) NOT NULL,
  duration_days    INT           NOT NULL,
  discount_percent NUMERIC(5,2)  NOT NULL DEFAULT 0,
  benefits         JSONB         NOT NULL DEFAULT '[]',
  is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
  is_deleted       BOOLEAN       NOT NULL DEFAULT FALSE,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER MEMBERSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_memberships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES users(id),
  membership_id UUID         NOT NULL REFERENCES memberships(id),
  start_date    DATE         NOT NULL,
  end_date      DATE         NOT NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'expired', 'cancelled')),
  is_deleted    BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID          NOT NULL REFERENCES users(id),
  booking_id            UUID          REFERENCES bookings(id),
  team_registration_id  UUID          REFERENCES team_registrations(id),
  user_membership_id    UUID          REFERENCES user_memberships(id),
  amount                NUMERIC(10,2) NOT NULL,
  currency              VARCHAR(10)   NOT NULL DEFAULT 'INR',
  payment_type          VARCHAR(30)   NOT NULL
                          CHECK (payment_type IN ('booking', 'tournament_registration', 'membership')),
  razorpay_order_id     VARCHAR(100),
  razorpay_payment_id   VARCHAR(100),
  razorpay_signature    VARCHAR(255),
  status                VARCHAR(20)   NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id),
  type       VARCHAR(50)  NOT NULL,
  subject    VARCHAR(255),
  message    TEXT         NOT NULL,
  channel    VARCHAR(20)  NOT NULL DEFAULT 'email'
               CHECK (channel IN ('email', 'sms', 'push')),
  status     VARCHAR(20)  NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at    TIMESTAMPTZ,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id   UUID,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_slots_date        ON slots (slot_date) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_bookings_user      ON bookings (user_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_bookings_slot      ON bookings (slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ref       ON bookings (booking_ref);
CREATE INDEX IF NOT EXISTS idx_booking_events     ON booking_events (booking_id);
CREATE INDEX IF NOT EXISTS idx_team_reg_team      ON team_registrations (team_id);
CREATE INDEX IF NOT EXISTS idx_team_reg_tourn     ON team_registrations (tournament_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships   ON user_memberships (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user         ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity       ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens     ON refresh_tokens (user_id) WHERE is_revoked = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id);

-- ============================================================
-- SEED: Default admin user (password: Admin@2026)
-- Run bcrypt externally and replace hash before seeding
-- ============================================================
-- INSERT INTO users (name, email, phone, password_hash, role, is_verified)
-- VALUES ('EBC Admin', 'admin@eagleboxcricket.com', '9000000000', '<bcrypt_hash>', 'admin', TRUE);
