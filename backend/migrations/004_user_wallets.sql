CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'TRC20',
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_wallets_user_address
  ON user_wallets (user_id, address);

CREATE INDEX IF NOT EXISTS idx_user_wallets_created
  ON user_wallets (created_at DESC);

DROP TRIGGER IF EXISTS trg_user_wallets_updated_at ON user_wallets;

DO $$
BEGIN
  CREATE TRIGGER trg_user_wallets_updated_at
  BEFORE UPDATE ON user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END;
$$;
