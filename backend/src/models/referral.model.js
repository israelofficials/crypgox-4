const { query } = require('../config/database')

const mapIso = (value) => (typeof value?.toISOString === 'function' ? value.toISOString() : value)

const safeParseJson = (value) => {
  if (!value) return {}
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch (error) {
    return {}
  }
}

const mapReward = (row) => ({
  id: row.id,
  referrerId: row.referrer_id,
  inviteId: row.invite_id,
  depositId: row.deposit_id,
  amount: Number(row.amount || 0),
  commissionRate: Number(row.commission_rate || 0),
  createdAt: mapIso(row.created_at),
})

const mapPayout = (row) => ({
  id: row.id,
  referrerId: row.referrer_id,
  amount: Number(row.amount || 0),
  status: row.status,
  metadata: safeParseJson(row.metadata),
  createdAt: mapIso(row.created_at),
})

const findRewardByDepositId = async (depositId) => {
  if (!depositId) return null
  const { rows } = await query(
    'SELECT * FROM referral_rewards WHERE deposit_id = $1 LIMIT 1',
    [depositId]
  )
  return rows[0] ? mapReward(rows[0]) : null
}

const createReward = async ({ referrerId, inviteId, depositId = null, amount, commissionRate }) => {
  const { rows } = await query(
    `INSERT INTO referral_rewards (referrer_id, invite_id, deposit_id, amount, commission_rate)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [referrerId, inviteId, depositId, amount, commissionRate]
  )
  return mapReward(rows[0])
}

const listRewardsByReferrer = async (referrerId) => {
  const { rows } = await query(
    `SELECT * FROM referral_rewards
      WHERE referrer_id = $1
      ORDER BY created_at DESC`,
    [referrerId]
  )
  return rows.map(mapReward)
}

const listPayoutsByReferrer = async (referrerId) => {
  const { rows } = await query(
    `SELECT * FROM referral_payouts
      WHERE referrer_id = $1
      ORDER BY created_at DESC`,
    [referrerId]
  )
  return rows.map(mapPayout)
}

const createPayout = async ({ referrerId, amount, status = 'COMPLETED', metadata = {} }) => {
  const { rows } = await query(
    `INSERT INTO referral_payouts (referrer_id, amount, status, metadata)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [referrerId, amount, status, JSON.stringify(metadata)]
  )
  return mapPayout(rows[0])
}

module.exports = {
  findRewardByDepositId,
  createReward,
  listRewardsByReferrer,
  listPayoutsByReferrer,
  createPayout,
}
