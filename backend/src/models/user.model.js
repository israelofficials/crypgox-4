const { USER_ROLES, REFERRAL_PAYOUT_THRESHOLD_INR } = require('../constants')
const { query, pool } = require('../config/database')
const { AppError } = require('../utils/errors')

const mapIso = (value) => (typeof value?.toISOString === 'function' ? value.toISOString() : value)
const parseJsonColumn = (value) => {
  if (!value) return null
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch (error) {
    return null
  }
}

const mapUser = (row) => {
  if (!row) return null
  return {
    id: row.id,
    phone: row.phone,
    role: row.role,
    name: row.name || `User ${row.phone.slice(-4)}`,
    avatarUrl: row.avatar_url,
    balance: Number(row.balance || 0),
    currency: row.currency || 'USDT',
    inviteCode: row.invite_code,
    status: row.status || 'ACTIVE',
    referredBy: row.referred_by,
    stats: {
      totalDeposits: Number(row.total_deposits || 0),
      totalWithdrawals: Number(row.total_withdrawals || 0),
      tier: 'Standard',
    },
    createdAt: mapIso(row.created_at),
    updatedAt: mapIso(row.updated_at),
    lastLoginAt: mapIso(row.last_login_at),
  }
}

const createUser = async (phone, profile = {}) => {
  const { rows } = await query(
    `INSERT INTO users (phone, role, name, avatar_url, balance, total_deposits, total_withdrawals, last_login_at, currency, status, referred_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), COALESCE($8, 'USDT'), COALESCE($9, 'ACTIVE'), $10)
     ON CONFLICT (phone) DO UPDATE SET
       name = COALESCE(EXCLUDED.name, users.name),
       avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
       status = COALESCE(EXCLUDED.status, users.status),
       referred_by = COALESCE(users.referred_by, EXCLUDED.referred_by)
     RETURNING *`,
    [
      phone,
      USER_ROLES.USER,
      profile.name || null,
      profile.avatarUrl || null,
      profile.balance ?? 0,
      profile.totalDeposits ?? 0,
      profile.totalWithdrawals ?? 0,
      profile.currency || null,
      profile.status || null,
      profile.referredBy || null,
    ]
  )

  return mapUser(rows[0])
}

const findByPhone = async (phone) => {
  const { rows } = await query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [phone])
  return mapUser(rows[0])
}

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id])
  return mapUser(rows[0])
}

const updateUser = async (id, updates = {}) => {
  const fieldMap = {
    name: 'name',
    avatarUrl: 'avatar_url',
    balance: 'balance',
    totalDeposits: 'total_deposits',
    totalWithdrawals: 'total_withdrawals',
    role: 'role',
    lastLoginAt: 'last_login_at',
    currency: 'currency',
    inviteCode: 'invite_code',
    status: 'status',
    referredBy: 'referred_by',
  }

  const entries = Object.entries(updates)
    .filter(([key, value]) => fieldMap[key] && value !== undefined)

  if (!entries.length) {
    return findById(id)
  }

  const setFragments = entries.map(([,], index) => `${fieldMap[entries[index][0]]} = $${index + 2}`)
  const values = entries.map(([, value]) => value)

  const { rows } = await query(
    `UPDATE users SET ${setFragments.join(', ')}, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, ...values]
  )

  return mapUser(rows[0])
}

const touchLastLogin = async (id) => {
  const { rows } = await query(
    'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *',
    [id]
  )
  return mapUser(rows[0])
}

const mapStatement = (row) => ({
  id: row.id,
  type: row.entry_type,
  amount: Number(row.amount || 0),
  balanceAfter: Number(row.balance_after || 0),
  metadata: row.metadata || {},
  createdAt: mapIso(row.created_at),
})

const mapTransfer = (row) => ({
  id: row.id,
  amount: Number(row.amount || 0),
  status: row.status,
  txId: row.tx_id,
  network: row.network,
  destination: row.destination,
  notes: parseJsonColumn(row.notes) ?? row.notes ?? null,
  createdAt: mapIso(row.created_at),
})

const mapPayee = (row) => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  upiId: row.upi_id,
  bankName: row.bank_name,
  accountNumber: row.account_number,
  ifsc: row.ifsc,
  createdAt: mapIso(row.created_at),
  updatedAt: mapIso(row.updated_at),
})

const mapSellOrder = (row) => {
  const notes = parseJsonColumn(row.notes) || {}
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount || notes.amountUsdt || 0),
    status: notes.status || row.status,
    destination: row.destination,
    txId: row.tx_id || notes.txId || null,
    notes,
    createdAt: mapIso(row.created_at),
  }
}

const mapWallet = (row) => ({
  id: row.id,
  address: row.address,
  network: row.network,
  label: row.label,
  createdAt: mapIso(row.created_at),
  updatedAt: mapIso(row.updated_at),
})

const mapInvite = (row) => ({
  id: row.id,
  referrerId: row.user_id,
  inviteePhone: row.invitee_phone,
  inviteeUserId: row.invitee_user_id,
  status: row.status,
  reward: Number(row.reward || 0),
  rewardRedeemed: Number(row.reward_redeemed || 0),
  createdAt: mapIso(row.created_at),
})

const updateStatementByWithdrawalId = async (userId, withdrawalId, updates = {}) => {
  const allowedFields = {
    type: 'entry_type',
    amount: 'amount',
    balanceAfter: 'balance_after',
    metadata: 'metadata',
  }

  const entries = Object.entries(updates).filter(([key, value]) => allowedFields[key] && value !== undefined)
  if (!entries.length) {
    return null
  }

  const setFragments = entries.map(([key], index) => `${allowedFields[key]} = $${index + 3}`)
  const values = entries.map(([key, value]) => (key === 'metadata' ? value : value))

  const { rows } = await query(
    `UPDATE user_statements
        SET ${setFragments.join(', ')}
      WHERE id = (
        SELECT id
          FROM user_statements
         WHERE user_id = $1
           AND metadata->>'withdrawalId' = $2
         ORDER BY created_at DESC
         LIMIT 1
      )
      RETURNING id, entry_type, amount, balance_after, metadata, created_at`,
    [userId, withdrawalId, ...values]
  )

  if (!rows.length) {
    return null
  }

  return mapStatement(rows[0])
}

const getUserRelations = async (userId) => {
  const statements = await query(
    `SELECT id, entry_type, amount, balance_after, metadata, created_at
     FROM user_statements WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [userId]
  )

  const deposits = await query(
    `SELECT id, amount, status, tx_id, network, notes, created_at
     FROM user_deposits WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [userId]
  )

  const withdrawals = await query(
    `SELECT id, amount, status, destination, tx_id, notes, created_at
     FROM user_withdrawals WHERE user_id = $1
       AND (notes IS NULL OR (notes::jsonb->>'type') IS DISTINCT FROM 'SELL')
     ORDER BY created_at DESC
     LIMIT 20`,
    [userId]
  )

  const sellOrders = await query(
    `SELECT id, user_id, amount, status, destination, tx_id, notes, created_at
     FROM user_withdrawals WHERE user_id = $1
       AND (notes::jsonb->>'type') = 'SELL'
     ORDER BY created_at DESC
     LIMIT 20`,
    [userId]
  )

  const wallets = await query(
    `SELECT id, address, network, label, created_at, updated_at
       FROM user_wallets
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId]
  )

  const invites = await query(
    `SELECT id, user_id, invitee_phone, invitee_user_id, status, reward, reward_redeemed, created_at
     FROM user_invites WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId]
  )

  const payees = await query(
    `SELECT id, user_id, name, upi_id, bank_name, account_number, ifsc, created_at, updated_at
       FROM user_payees
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId]
  )

  return {
    statements: statements.rows.map(mapStatement),
    deposits: deposits.rows.map(mapTransfer),
    withdrawals: withdrawals.rows.map(mapTransfer),
    sellOrders: sellOrders.rows.map(mapSellOrder),
    wallets: wallets.rows.map(mapWallet),
    invites: invites.rows.map(mapInvite),
    payees: payees.rows.map(mapPayee),
  }
}

const getUserProfile = async (id) => {
  const user = await findById(id)
  if (!user) {
    return null
  }

  const relations = await getUserRelations(id)

  const totalReward = relations.invites.reduce((sum, item) => sum + (item.reward || 0), 0)
  const redeemedReward = relations.invites.reduce((sum, item) => sum + (item.rewardRedeemed || 0), 0)
  const availableReward = Math.max(0, totalReward - redeemedReward)
  const payoutThreshold = REFERRAL_PAYOUT_THRESHOLD_INR
  const eligibleForPayout = availableReward >= payoutThreshold

  const inviteSummary = {
    code: user.inviteCode,
    total: relations.invites.length,
    completed: relations.invites.filter((item) => item.status === 'COMPLETED').length,
    pending: relations.invites.filter((item) => item.status !== 'COMPLETED').length,
    totalReward,
    redeemedReward,
    availableReward,
    payoutThreshold,
    eligibleForPayout,
    list: relations.invites,
  }

  return {
    ...user,
    statements: relations.statements,
    deposits: relations.deposits,
    withdrawals: relations.withdrawals,
    sellOrders: relations.sellOrders,
    wallets: relations.wallets,
    invites: inviteSummary,
    payees: relations.payees,
  }
}

const createStatement = async (userId, { type, amount, balanceAfter, metadata = {} }) => {
  const { rows } = await query(
    `INSERT INTO user_statements (user_id, entry_type, amount, balance_after, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, entry_type, amount, balance_after, metadata, created_at`,
    [userId, type, amount, balanceAfter, metadata]
  )

  return mapStatement(rows[0])
}

const createDeposit = async (userId, { amount, status = 'PENDING', txId = null, network = null, notes = null }) => {
  const { rows } = await query(
    `INSERT INTO user_deposits (user_id, amount, status, tx_id, network, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, amount, status, tx_id, network, notes, created_at`,
    [userId, amount, status, txId, network, notes]
  )

  return mapTransfer(rows[0])
}

const createWithdrawal = async (userId, { amount, status = 'PENDING', destination = null, notes = null }) => {
  const { rows } = await query(
    `INSERT INTO user_withdrawals (user_id, amount, status, destination, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, amount, status, destination, notes, created_at`,
    [userId, amount, status, destination, notes]
  )

  return mapTransfer(rows[0])
}

const createInvite = async (
  userId,
  { inviteePhone = null, inviteeUserId = null, status = 'PENDING', reward = 0, rewardRedeemed = 0 }
) => {
  const { rows } = await query(
    `INSERT INTO user_invites (user_id, invitee_phone, invitee_user_id, status, reward, reward_redeemed)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, inviteePhone, inviteeUserId, status, reward, rewardRedeemed]
  )

  return mapInvite(rows[0])
}

const updateInvite = async (id, updates = {}) => {
  const fieldMap = {
    inviteePhone: 'invitee_phone',
    inviteeUserId: 'invitee_user_id',
    status: 'status',
    reward: 'reward',
    rewardRedeemed: 'reward_redeemed',
  }

  const entries = Object.entries(updates).filter(([key, value]) => fieldMap[key] && value !== undefined)
  if (!entries.length) {
    const { rows } = await query('SELECT * FROM user_invites WHERE id = $1 LIMIT 1', [id])
    return rows[0] ? mapInvite(rows[0]) : null
  }

  const setFragments = entries.map(([,], index) => `${fieldMap[entries[index][0]]} = $${index + 2}`)
  const values = entries.map(([, value]) => value)

  const { rows } = await query(
    `UPDATE user_invites SET ${setFragments.join(', ')}, reward_redeemed = COALESCE(reward_redeemed, 0)
     WHERE id = $1 RETURNING *`,
    [id, ...values]
  )

  return rows[0] ? mapInvite(rows[0]) : null
}

const findInviteByInviteeUserId = async (inviteeUserId) => {
  const { rows } = await query('SELECT * FROM user_invites WHERE invitee_user_id = $1 LIMIT 1', [inviteeUserId])
  return rows[0] ? mapInvite(rows[0]) : null
}

const findInviteByInviteePhone = async (inviteePhone) => {
  const { rows } = await query('SELECT * FROM user_invites WHERE invitee_phone = $1 LIMIT 1', [inviteePhone])
  return rows[0] ? mapInvite(rows[0]) : null
}

const findByInviteCode = async (inviteCode) => {
  const { rows } = await query('SELECT * FROM users WHERE invite_code = $1 LIMIT 1', [inviteCode])
  return mapUser(rows[0])
}

const addRewardToInvite = async (inviteId, amount) => {
  const { rows } = await query(
    `UPDATE user_invites
        SET reward = COALESCE(reward, 0) + $2
      WHERE id = $1
      RETURNING *`,
    [inviteId, amount]
  )

  return rows[0] ? mapInvite(rows[0]) : null
}

const incrementInviteRewardRedeemed = async (inviteId, amount) => {
  const { rows } = await query(
    `UPDATE user_invites
        SET reward_redeemed = COALESCE(reward_redeemed, 0) + $2
      WHERE id = $1
      RETURNING *`,
    [inviteId, amount]
  )

  return rows[0] ? mapInvite(rows[0]) : null
}

const redeemInviteReward = async ({ userId, amount }) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: inviteRows } = await client.query(
      `SELECT id, reward, reward_redeemed
         FROM user_invites
        WHERE user_id = $1
        FOR UPDATE`,
      [userId]
    )

    if (!inviteRows.length) {
      throw new AppError(400, 'No referral rewards available')
    }

    let remaining = amount
    for (const invite of inviteRows) {
      if (remaining <= 0) break
      const available = Number(invite.reward || 0) - Number(invite.reward_redeemed || 0)
      if (available <= 0) continue
      const toRedeem = Math.min(remaining, available)
      await client.query(
        `UPDATE user_invites
            SET reward_redeemed = COALESCE(reward_redeemed, 0) + $2
          WHERE id = $1`,
        [invite.id, toRedeem]
      )
      remaining -= toRedeem
    }

    if (remaining > 0) {
      throw new AppError(400, 'Insufficient invite balance')
    }

    const { rows: userRows } = await client.query(
      `UPDATE users
          SET balance = COALESCE(balance, 0) + $2
        WHERE id = $1
        RETURNING *`,
      [userId, amount]
    )

    const user = mapUser(userRows[0])
    if (!user) {
      throw new AppError(404, 'User not found')
    }

    await client.query(
      `INSERT INTO user_statements (user_id, entry_type, amount, balance_after, metadata)
       VALUES ($1, 'REFERRAL_REWARD_CLAIM', $2, $3, $4)`,
      [
        userId,
        amount,
        user.balance,
        JSON.stringify({ source: 'REFERRAL', note: 'Referral earnings moved to balance' }),
      ]
    )

    await client.query('COMMIT')
    return user
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

const listInvitesByUser = async (userId) => {
  const { rows } = await query(
    `SELECT id, user_id, invitee_phone, invitee_user_id, status, reward, reward_redeemed, created_at
       FROM user_invites
      WHERE user_id = $1
      ORDER BY created_at ASC`,
    [userId]
  )

  return rows.map(mapInvite)
}

const listUsers = async ({ search = '', limit = 20, offset = 0, startDate, endDate }) => {
  const conditions = []
  const baseParams = []

  if (search) {
    baseParams.push(`%${search}%`)
    const phoneIdx = baseParams.length
    baseParams.push(`%${search}%`)
    const nameIdx = baseParams.length
    baseParams.push(`%${search}%`)
    const inviteIdx = baseParams.length
    conditions.push(`(phone ILIKE $${phoneIdx} OR name ILIKE $${nameIdx} OR invite_code ILIKE $${inviteIdx})`)
  }

  if (startDate) {
    baseParams.push(startDate)
    const startIdx = baseParams.length
    conditions.push(`created_at >= $${startIdx}`)
  }

  if (endDate) {
    baseParams.push(endDate)
    const endIdx = baseParams.length
    conditions.push(`created_at <= $${endIdx}`)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const countQuery = `SELECT COUNT(*)::int AS total FROM users ${whereClause}`
  const { rows: countRows } = await query(countQuery, baseParams)
  const total = countRows[0]?.total ?? 0

  const dataParams = [...baseParams]
  const limitIdx = dataParams.length + 1
  const offsetIdx = dataParams.length + 2
  dataParams.push(limit)
  dataParams.push(offset)

  const dataQuery = `
    SELECT id, phone, role, name, avatar_url, balance, total_deposits, total_withdrawals, currency, invite_code, status, created_at, updated_at, last_login_at
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${limitIdx}
    OFFSET $${offsetIdx}
  `

  const { rows } = await query(dataQuery, dataParams)

  return {
    users: rows.map(mapUser),
    total,
  }
}

const updateUserStatus = async (id, status) => {
  const allowed = ['ACTIVE', 'FROZEN', 'BLOCKED']
  const nextStatus = allowed.includes(status?.toUpperCase()) ? status.toUpperCase() : 'ACTIVE'
  const { rows } = await query(
    'UPDATE users SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id, nextStatus]
  )

  return mapUser(rows[0])
}

const getUserTransactions = async (userId) => {
  const relations = await getUserRelations(userId)
  return relations
}

module.exports = {
  createUser,
  findByPhone,
  findById,
  updateUser,
  touchLastLogin,
  getUserProfile,
  getUserRelations,
  createStatement,
  createDeposit,
  createWithdrawal,
  createInvite,
  updateInvite,
  findInviteByInviteeUserId,
  findInviteByInviteePhone,
  findByInviteCode,
  addRewardToInvite,
  incrementInviteRewardRedeemed,
  redeemInviteReward,
  listInvitesByUser,
  updateStatementByWithdrawalId,
  listUsers,
  updateUserStatus,
  getUserTransactions,
}
