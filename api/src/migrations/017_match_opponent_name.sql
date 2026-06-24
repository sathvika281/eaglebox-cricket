-- Migration 017: Allow scheduling matches against external opponents
ALTER TABLE matches ALTER COLUMN team_b_id DROP NOT NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS opponent_name VARCHAR(100);
