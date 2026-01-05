CREATE TABLE IF NOT EXISTS user_payees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  upi_id TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_payees_user_created
  ON user_payees (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION trg_user_payees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_user_payees_updated_at'
      AND tgrelid = 'user_payees'::regclass
  ) THEN
    EXECUTE 'DROP TRIGGER set_user_payees_updated_at ON user_payees';
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_user_payees_updated_at'
      AND tgrelid = 'user_payees'::regclass
  ) THEN
    EXECUTE $$
      CREATE TRIGGER set_user_payees_updated_at
      BEFORE UPDATE ON user_payees
      FOR EACH ROW
      EXECUTE FUNCTION trg_user_payees_updated_at()
    $$;
  END IF;
END;
$$;
