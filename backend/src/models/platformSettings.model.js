const { query } = require('../config/database')

const DEFAULT_SETTINGS = {
  baseRate: 99,
  pricingTiers: [],
  depositAddresses: [],
  inviteCommission: 0,
}

const CACHE_TTL_MS = 30 * 1000

let cachedSettings = null
let cacheExpiresAt = 0

const mapSettings = (row) => ({
  id: row.id,
  baseRate: Number(row.base_rate || DEFAULT_SETTINGS.baseRate),
  pricingTiers: Array.isArray(row.pricing_tiers) ? row.pricing_tiers : DEFAULT_SETTINGS.pricingTiers,
  depositAddresses: Array.isArray(row.deposit_addresses) ? row.deposit_addresses : DEFAULT_SETTINGS.depositAddresses,
  inviteCommission: Number(row.invite_commission || DEFAULT_SETTINGS.inviteCommission),
  updatedAt: row.updated_at,
})

const setCache = (settings) => {
  cachedSettings = settings
  cacheExpiresAt = Date.now() + CACHE_TTL_MS
  return settings
}

const getSettings = async ({ force = false } = {}) => {
  if (!force && cachedSettings && Date.now() < cacheExpiresAt) {
    return cachedSettings
  }

  const { rows } = await query('SELECT * FROM platform_settings WHERE id = 1 LIMIT 1')
  if (!rows[0]) {
    return setCache({ id: 1, ...DEFAULT_SETTINGS, updatedAt: null })
  }

  return setCache(mapSettings(rows[0]))
}

const upsertSettings = async (input = {}) => {
  const existing = await getSettings({ force: true })
  const updated = {
    baseRate: input.baseRate !== undefined ? Number(input.baseRate) : existing.baseRate,
    pricingTiers: input.pricingTiers !== undefined ? input.pricingTiers : existing.pricingTiers,
    depositAddresses: input.depositAddresses !== undefined ? input.depositAddresses : existing.depositAddresses,
    inviteCommission: input.inviteCommission !== undefined ? Number(input.inviteCommission) : existing.inviteCommission,
  }

  const { rows } = await query(
    `INSERT INTO platform_settings (id, base_rate, pricing_tiers, deposit_addresses, invite_commission)
     VALUES (1, $1, $2::jsonb, $3::text[], $4)
     ON CONFLICT (id) DO UPDATE SET
       base_rate = EXCLUDED.base_rate,
       pricing_tiers = EXCLUDED.pricing_tiers,
       deposit_addresses = EXCLUDED.deposit_addresses,
       invite_commission = EXCLUDED.invite_commission
     RETURNING *`,
    [
      updated.baseRate,
      JSON.stringify(updated.pricingTiers ?? []),
      updated.depositAddresses,
      updated.inviteCommission,
    ]
  )

  return setCache(mapSettings(rows[0]))
}

module.exports = {
  getSettings,
  upsertSettings,
}
