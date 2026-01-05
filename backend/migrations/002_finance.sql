CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  candidate TEXT;
BEGIN
  LOOP
    candidate := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE invite_code = candidate);
  END LOOP;
  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USDT';

UPDATE users
SET invite_code = generate_invite_code()
WHERE invite_code IS NULL;

ALTER TABLE users
  ALTER COLUMN invite_code SET NOT NULL,
  ALTER COLUMN invite_code SET DEFAULT generate_invite_code();

CREATE TABLE IF NOT EXISTS user_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(18, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  tx_id TEXT,
  network TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_deposits_user_created
  ON user_deposits (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(18, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  destination TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_withdrawals_user_created
  ON user_withdrawals (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL,
  amount NUMERIC(18, 2) NOT NULL,
  balance_after NUMERIC(18, 2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_statements_user_created
  ON user_statements (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_phone TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  reward NUMERIC(18, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_invites_user_created
  ON user_invites (user_id, created_at DESC);
