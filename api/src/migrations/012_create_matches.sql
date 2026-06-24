-- Migration 012: Friendly match scheduling
CREATE TABLE IF NOT EXISTS matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_ref     VARCHAR(20)  NOT NULL UNIQUE DEFAULT CONCAT('MCH', UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8))),
  team_a_id     UUID         NOT NULL REFERENCES teams(id),
  team_b_id     UUID         NOT NULL REFERENCES teams(id),
  slot_id       UUID         REFERENCES slots(id),
  booking_id    UUID         REFERENCES bookings(id),
  match_date    DATE         NOT NULL,
  match_time    TIME         NOT NULL,
  venue_note    VARCHAR(255),
  status        VARCHAR(20)  NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  result        TEXT,
  winner_team_id UUID        REFERENCES teams(id),
  created_by    UUID         NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT teams_differ CHECK (team_a_id != team_b_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_team_a    ON matches (team_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_team_b    ON matches (team_b_id);
CREATE INDEX IF NOT EXISTS idx_matches_date      ON matches (match_date);
CREATE INDEX IF NOT EXISTS idx_matches_created_by ON matches (created_by);
