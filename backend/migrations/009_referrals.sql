ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);

ALTER TABLE user_invites
  ADD COLUMN IF NOT EXISTS invitee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reward_redeemed NUMERIC(18, 2) NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_invites_invitee_user_id
  ON user_invites (invitee_user_id)
  WHERE invitee_user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invite_id UUID NOT NULL REFERENCES user_invites(id) ON DELETE CASCADE,
  deposit_id UUID REFERENCES user_deposits(id) ON DELETE SET NULL,
  amount NUMERIC(18, 2) NOT NULL,
  commission_rate NUMERIC(6, 3) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer_created
  ON referral_rewards (referrer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS referral_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(18, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_payouts_referrer_created
  ON referral_payouts (referrer_id, created_at DESC);
