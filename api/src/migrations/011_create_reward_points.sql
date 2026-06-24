-- Migration 011: Loyalty & reward points system
CREATE TABLE IF NOT EXISTS reward_points (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID  NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_points     INT   NOT NULL DEFAULT 0,
  lifetime_points  INT   NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID         NOT NULL REFERENCES users(id),
  points       INT          NOT NULL,
  type         VARCHAR(30)  NOT NULL
                 CHECK (type IN ('booking_completed', 'payment_success', 'redeemed', 'expired', 'bonus', 'referral')),
  description  TEXT,
  reference_id UUID,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_points_user ON reward_points (user_id);
CREATE INDEX IF NOT EXISTS idx_reward_txn_user    ON reward_transactions (user_id);
