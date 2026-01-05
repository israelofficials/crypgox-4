ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE';

CREATE TABLE IF NOT EXISTS platform_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  base_rate NUMERIC(12, 4) NOT NULL DEFAULT 99,
  pricing_tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  deposit_addresses TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  invite_commission NUMERIC(12, 4) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_platform_settings_updated_at()
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
    WHERE tgname = 'trg_platform_settings_updated_at'
      AND tgrelid = 'platform_settings'::regclass
  ) THEN
    EXECUTE 'DROP TRIGGER trg_platform_settings_updated_at ON platform_settings';
  END IF;
END
$$;
CREATE TRIGGER trg_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE PROCEDURE set_platform_settings_updated_at();

INSERT INTO platform_settings (id, base_rate, pricing_tiers, deposit_addresses, invite_commission)
VALUES (
  1,
  99,
  '[{"range": ">=1000.01 and <2000.01", "markup": "+ 0.25"}, {"range": ">=2000.01 and <3000.01", "markup": "+ 0.50"}, {"range": ">=3000.01 and <5000.01", "markup": "+ 1.00"}, {"range": ">=5000.01", "markup": "+ 1.50"}]'::jsonb,
  ARRAY['TVc8eppD83fEeszizkh1KWEg1WXtifV5qJ', 'TQw2mPY6vEoN9ad1Hkz4Bm7t3QFsg1Pxr'],
  7.5
)
ON CONFLICT (id) DO NOTHING;
