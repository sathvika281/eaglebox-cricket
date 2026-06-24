-- Migration 016: Match Gallery
CREATE TABLE IF NOT EXISTS match_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id     UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  uploaded_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_url    TEXT NOT NULL,
  caption      VARCHAR(300),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_photos_match ON match_photos(match_id);
