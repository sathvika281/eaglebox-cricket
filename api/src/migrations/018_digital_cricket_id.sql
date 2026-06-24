-- 018_digital_cricket_id.sql
-- Digital Cricket ID: player profiles, achievement tracking, activity timeline

CREATE SEQUENCE IF NOT EXISTS cricket_id_seq START 100 INCREMENT 1;

CREATE TABLE IF NOT EXISTS player_profiles (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  cricket_id         VARCHAR(25) NOT NULL UNIQUE,
  bio                TEXT,
  profile_visibility VARCHAR(20) NOT NULL DEFAULT 'public'
                     CHECK (profile_visibility IN ('public', 'private')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_achievements (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  earned_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

CREATE TABLE IF NOT EXISTS player_activity (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  description   TEXT        NOT NULL,
  entity_id     UUID,
  entity_type   VARCHAR(50),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pp_user   ON player_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_pp_cid    ON player_profiles(cricket_id);
CREATE INDEX IF NOT EXISTS idx_pa_user   ON player_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_pact_user ON player_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_pact_ts   ON player_activity(created_at DESC);
