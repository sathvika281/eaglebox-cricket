-- Migration 008: Extend teams table + add team_members
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS logo_url    VARCHAR(500),
  ADD COLUMN IF NOT EXISTS status      VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive'));

CREATE TABLE IF NOT EXISTS team_members (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id        UUID         NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id        UUID         REFERENCES users(id) ON DELETE SET NULL,
  player_name    VARCHAR(100) NOT NULL,
  player_phone   VARCHAR(15),
  player_email   VARCHAR(255),
  role           VARCHAR(20)  NOT NULL DEFAULT 'player'
                   CHECK (role IN ('captain', 'vice_captain', 'player')),
  jersey_number  INT,
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  joined_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members (team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members (user_id);
