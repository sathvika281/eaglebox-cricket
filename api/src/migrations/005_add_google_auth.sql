-- Migration 005: Add Google OAuth support
-- Makes phone nullable (Google users don't have a phone number)
-- Adds google_id column for linking Google accounts

ALTER TABLE users
  ALTER COLUMN phone DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
