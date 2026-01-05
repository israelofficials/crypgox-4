const asyncHandler = require('../../utils/asyncHandler')
const { query } = require('../../config/database')
const { AppError } = require('../../utils/errors')
const platformSettingsModel = require('../../models/platformSettings.model')
const userModel = require('../../models/user.model')
const withdrawalModel = require('../../models/withdrawal.model')

const toNumber = (value) => (value === null || value === undefined ? 0 : Number(value))

const parseJsonColumn = (value) => {
  if (!value) return null
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch (error) {
    return { raw: value }
  }
}

const mapDeposit = (row) => ({
  id: row.id,
  userId: row.user_id,
  userName: row.name || row.phone,
  userPhone: row.phone,
  amount: Number(row.amount || 0),
  status: row.status,
  txId: row.tx_id,
  network: row.network,
  createdAt: row.created_at,
  notes: parseJsonColumn(row.notes),
})

const mapWithdrawal = (row) => ({
  id: row.id,
  userId: row.user_id,
  userName: row.name || row.phone,
  userPhone: row.phone,
  amount: Number(row.amount || 0),
  status: row.status,
  destination: row.destination,
  txId: row.tx_id,
  createdAt: row.created_at,
  notes: parseJsonColumn(row.notes),
})

const mapSellOrder = (row) => {
  if (!row) {
    return null
  }

  const metadataSource = row.metadata || row.notes || {}
  const metadata = metadataSource && typeof metadataSource === 'object' ? metadataSource : {}

  return {
    id: row.id,
    userId: row.userId || row.user_id,
    userName: row.userName || row.name || row.phone || null,
    userPhone: row.userPhone || row.phone || null,
    entryType: metadata.status || row.entryType || row.status || 'SELL_ORDER',
    amount: Number(row.amount || metadata.amountUsdt || 0),
    createdAt: row.createdAt || row.created_at,
    metadata,
  }
}

const toIsoOrUndefined = (value) => {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }
  return date.toISOString()
}

const appendHistoryEntry = (metadata, entry) => {
  const base = metadata && typeof metadata === 'object' ? { ...metadata } : {}
  const history = Array.isArray(base.history) ? [...base.history] : []
  history.push({
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  })
  base.history = history
  return base
}

const getMetrics = asyncHandler(async (req, res) => {
  const [{ rows: userAggregateRows }, { rows: depositRows }, { rows: withdrawalRows }, { rows: sellRows }] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS total_users,
              COALESCE(SUM(balance), 0) AS total_usdt
         FROM users`
    ),
    query(
      `SELECT COUNT(*)::int AS pending_count
         FROM user_deposits
        WHERE status NOT IN ('COMPLETED', 'CANCELLED')`
    ),
    query(
      `SELECT COUNT(*)::int AS pending_count
         FROM user_withdrawals
        WHERE status NOT IN ('COMPLETED', 'CANCELLED')`
    ),
    query(
      `SELECT COUNT(*)::int AS pending_count
         FROM user_withdrawals
        WHERE (notes::jsonb->>'type') = 'SELL'
          AND status NOT IN ('COMPLETED', 'REJECTED', 'FAILED')`
    ),
  ])

  const totalUsers = userAggregateRows[0]?.total_users ?? 0
  const totalUsdt = toNumber(userAggregateRows[0]?.total_usdt)
  const pendingDeposits = depositRows[0]?.pending_count ?? 0
  const pendingWithdrawals = withdrawalRows[0]?.pending_count ?? 0
  const pendingSellOrders = sellRows[0]?.pending_count ?? 0

  const { rows: ledgerRows } = await query(
    `SELECT
        COALESCE(SUM(CASE WHEN entry_type = 'INR_SETTLEMENT' THEN amount ELSE 0 END), 0) AS total_inr,
        COALESCE(SUM(CASE WHEN entry_type = 'USDT_LEDGER' THEN amount ELSE 0 END), 0) AS ledger_usdt
      FROM user_statements`
  )

  const totalInr = toNumber(ledgerRows[0]?.total_inr)
  const ledgerUsdt = toNumber(ledgerRows[0]?.ledger_usdt)

  const walletBalances = {
    usdt: ledgerUsdt || totalUsdt,
    inr: totalInr,
  }

  res.status(200).json({
    metrics: {
      totalUsers,
      totalUsdt,
      totalInr,
      pendingDeposits,
      pendingWithdrawals,
      pendingSellOrders,
      walletBalances,
    },
  })
})

const getSettings = asyncHandler(async (req, res) => {
  const settings = await platformSettingsModel.getSettings()
  res.status(200).json({ settings })
})

const updateSettings = asyncHandler(async (req, res) => {
  const { baseRate, pricingTiers, depositAddresses, inviteCommission } = req.body || {}

  const parsedTiers = Array.isArray(pricingTiers) ? pricingTiers : undefined
  const parsedAddresses = Array.isArray(depositAddresses) ? depositAddresses : undefined

  const settings = await platformSettingsModel.upsertSettings({
    baseRate: baseRate !== undefined ? Number(baseRate) : undefined,
    pricingTiers: parsedTiers,
    depositAddresses: parsedAddresses,
    inviteCommission: inviteCommission !== undefined ? Number(inviteCommission) : undefined,
  })

  res.status(200).json({ settings })
})

const listUsers = asyncHandler(async (req, res) => {
  const { search = '', limit = 20, offset = 0, startDate, endDate } = req.query

  const result = await userModel.listUsers({
    search: String(search || ''),
    limit: Number(limit) || 20,
    offset: Number(offset) || 0,
    startDate: toIsoOrUndefined(startDate),
    endDate: toIsoOrUndefined(endDate),
  })

  res.status(200).json(result)
})

const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { status } = req.body || {}
  if (!userId || !status) {
    throw new AppError(400, 'User ID and status are required')
  }

  const user = await userModel.updateUserStatus(userId, status)
  res.status(200).json({ user })
})

const getUserTransactions = asyncHandler(async (req, res) => {
  const { userId } = req.params
  if (!userId) {
    throw new AppError(400, 'User ID is required')
  }

  const relations = await userModel.getUserTransactions(userId)
  res.status(200).json(relations)
})

const getTransactions = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 50
  const startDate = toIsoOrUndefined(req.query.startDate)
  const endDate = toIsoOrUndefined(req.query.endDate)

  const buildDateFilter = (alias) => {
    const conditions = []
    const params = []

    if (startDate) {
      params.push(startDate)
      conditions.push(`${alias}.created_at >= $${params.length}`)
    }

    if (endDate) {
      params.push(endDate)
      conditions.push(`${alias}.created_at <= $${params.length}`)
    }

    return { conditions, params }
  }

  const { conditions: depositConditions, params: depositParamsBase } = buildDateFilter('d')
  const depositWhere = depositConditions.length ? `WHERE ${depositConditions.join(' AND ')}` : ''
  const depositParams = [...depositParamsBase, limit]
  const depositLimitIdx = depositParams.length

  const { conditions: withdrawalConditions, params: withdrawalParamsBase } = buildDateFilter('w')
  const withdrawalWhere = withdrawalConditions.length ? `WHERE ${withdrawalConditions.join(' AND ')}` : ''
  const withdrawalParams = [...withdrawalParamsBase, limit]
  const withdrawalLimitIdx = withdrawalParams.length

  const { conditions: sellOrderConditions, params: sellOrderParamsBase } = buildDateFilter('s')
  const sellOrderClauses = [`s.entry_type IN ('SELL_ORDER', 'INR_SETTLEMENT', 'PAYOUT')`, ...sellOrderConditions]
  const sellOrderWhere = `WHERE ${sellOrderClauses.join(' AND ')}`
  const sellOrderParams = [...sellOrderParamsBase, limit]
  const sellOrderLimitIdx = sellOrderParams.length

  const [depositResult, withdrawalResult, sellOrderRows] = await Promise.all([
    query(
      `SELECT d.id, d.user_id, u.phone, u.name, d.amount, d.status, d.tx_id, d.network, d.created_at, d.notes
         FROM user_deposits d
         JOIN users u ON u.id = d.user_id
        ${depositWhere}
        ORDER BY d.created_at DESC
        LIMIT $${depositLimitIdx}`,
      depositParams
    ),
    query(
      `SELECT w.id, w.user_id, u.phone, u.name, w.amount, w.status, w.destination, w.tx_id, w.created_at, w.notes
         FROM user_withdrawals w
         JOIN users u ON u.id = w.user_id
        ${withdrawalWhere}
        ORDER BY w.created_at DESC
        LIMIT $${withdrawalLimitIdx}`,
      withdrawalParams
    ),
    withdrawalModel.listSellOrders({
      limit,
      startDate,
      endDate,
    }),
  ])

  res.status(200).json({
    deposits: depositResult.rows.map(mapDeposit),
    withdrawals: withdrawalResult.rows.map(mapWithdrawal),
    sellOrders: sellOrderRows.map(mapSellOrder),
  })
})

const completeSellOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params
  const { txId, note, payoutInr } = req.body || {}

  if (!orderId) {
    throw new AppError(400, 'Sell order reference missing')
  }

  const existing = await withdrawalModel.findSellOrderByIdRaw(orderId)
  if (!existing) {
    throw new AppError(404, 'Sell order not found')
  }

  if (existing.status === 'COMPLETED') {
    const user = await userModel.findById(existing.userId)
    return res.status(200).json({ sellOrder: mapSellOrder({ ...existing, userName: user?.name || user?.phone, userPhone: user?.phone }) })
  }

  const baseMetadata = existing.notes && typeof existing.notes === 'object' ? { ...existing.notes } : {}
  const metadata = appendHistoryEntry(
    {
      ...baseMetadata,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      ...(payoutInr !== undefined ? { payoutInr: Number(payoutInr) } : {}),
      ...(txId ? { txId } : {}),
      ...(note ? { adminNote: note } : {}),
    },
    {
      status: 'COMPLETED',
      actor: 'ADMIN',
      ...(txId ? { txId } : {}),
      ...(note ? { note } : {}),
    }
  )

  const updated = await withdrawalModel.updateWithdrawalOrder(orderId, {
    status: 'COMPLETED',
    txId: txId || existing.txId,
    notes: metadata,
  })

  await userModel.updateStatementByWithdrawalId(existing.userId, existing.id, {
    type: 'SELL_ORDER_COMPLETED',
    metadata: {
      ...metadata,
      withdrawalId: existing.id,
    },
  })

  const user = await userModel.findById(existing.userId)
  const refreshed = await withdrawalModel.findSellOrderByIdRaw(orderId)

  res.status(200).json({
    sellOrder: mapSellOrder({
      ...refreshed,
      userName: user?.name || user?.phone,
      userPhone: user?.phone,
    }),
  })
})

const rejectSellOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params
  const { reason, note } = req.body || {}

  if (!orderId) {
    throw new AppError(400, 'Sell order reference missing')
  }

  const existing = await withdrawalModel.findSellOrderByIdRaw(orderId)
  if (!existing) {
    throw new AppError(404, 'Sell order not found')
  }

  if (existing.status === 'REJECTED') {
    const user = await userModel.findById(existing.userId)
    return res.status(200).json({ sellOrder: mapSellOrder({ ...existing, userName: user?.name || user?.phone, userPhone: user?.phone }) })
  }

  const rejectionReason = reason && typeof reason === 'string' ? reason : 'Rejected by administrator'

  const baseMetadata = existing.notes && typeof existing.notes === 'object' ? { ...existing.notes } : {}
  const metadata = appendHistoryEntry(
    {
      ...baseMetadata,
      status: 'REJECTED',
      rejectedAt: new Date().toISOString(),
      reason: rejectionReason,
      ...(note ? { adminNote: note } : {}),
    },
    {
      status: 'REJECTED',
      actor: 'ADMIN',
      reason: rejectionReason,
      ...(note ? { note } : {}),
    }
  )

  const amount = Number(existing.amount || metadata.amountUsdt || 0)
  const user = await userModel.findById(existing.userId)
  if (!user) {
    throw new AppError(404, 'User not found for sell order')
  }

  const currentBalance = Number(user.balance || 0)
  const totalWithdrawals = Math.max(0, Number(user.stats?.totalWithdrawals || 0) - amount)
  const newBalance = currentBalance + amount

  const updatedUser = await userModel.updateUser(user.id, {
    balance: newBalance,
    totalWithdrawals,
  })

  await withdrawalModel.updateWithdrawalOrder(orderId, {
    status: 'REJECTED',
    notes: metadata,
  })

  await userModel.updateStatementByWithdrawalId(user.id, existing.id, {
    type: 'SELL_ORDER_REJECTED',
    amount: -amount,
    balanceAfter: Number(updatedUser.balance || newBalance),
    metadata: {
      ...metadata,
      withdrawalId: existing.id,
    },
  })

  await userModel.createStatement(user.id, {
    type: 'SELL_ORDER_REFUND',
    amount,
    balanceAfter: Number(updatedUser.balance || newBalance),
    metadata: {
      withdrawalId: existing.id,
      reason: rejectionReason,
      bank: metadata.bank || null,
    },
  })

  const refreshed = await withdrawalModel.findSellOrderByIdRaw(orderId)

  res.status(200).json({
    sellOrder: mapSellOrder({
      ...refreshed,
      userName: updatedUser.name || updatedUser.phone,
      userPhone: updatedUser.phone,
    }),
  })
})

const approveWithdrawal = asyncHandler(async (req, res) => {
  const { withdrawalId } = req.params
  const { txId } = req.body || {}

  if (!withdrawalId) {
    throw new AppError(400, 'Withdrawal reference missing')
  }

  const withdrawal = await withdrawalModel.findWithdrawalById(withdrawalId)
  if (!withdrawal) {
    throw new AppError(404, 'Withdrawal order not found')
  }

  const baseNotes = (withdrawal.notes && typeof withdrawal.notes === 'object') ? withdrawal.notes : {}
  const feeAmount = Number(baseNotes.fee ?? 0) || 0
  const totalDebit = Number(withdrawal.amount || 0) + feeAmount

  const updated = await withdrawalModel.updateWithdrawalOrder(withdrawalId, {
    status: 'COMPLETED',
    txId: txId || withdrawal.txId,
    notes: {
      ...baseNotes,
      approvedAt: new Date().toISOString(),
      txId: txId || withdrawal.txId,
    },
  })

  const user = await userModel.findById(withdrawal.userId)

  await userModel.updateStatementByWithdrawalId(withdrawal.userId, withdrawal.id, {
    type: 'WITHDRAWAL_COMPLETED',
    amount: -totalDebit,
    balanceAfter: Number(user.balance || 0),
    metadata: {
      ...baseNotes,
      withdrawalId: updated.id,
      destination: updated.destination,
      txId: updated.txId,
      status: updated.status,
      fee: feeAmount,
      totalDebit,
    },
  })

  res.status(200).json({ withdrawal: updated })
})

const rejectWithdrawal = asyncHandler(async (req, res) => {
  const { withdrawalId } = req.params
  const { reason } = req.body || {}

  if (!withdrawalId) {
    throw new AppError(400, 'Withdrawal reference missing')
  }

  const withdrawal = await withdrawalModel.findWithdrawalById(withdrawalId)
  if (!withdrawal) {
    throw new AppError(404, 'Withdrawal order not found')
  }

  if (withdrawal.status === 'REJECTED') {
    return res.status(200).json({ withdrawal })
  }

  const baseNotes = (withdrawal.notes && typeof withdrawal.notes === 'object') ? withdrawal.notes : {}
  const feeAmount = Number(baseNotes.fee ?? 0) || 0
  const totalDebit = Number(withdrawal.amount || 0) + feeAmount

  const updated = await withdrawalModel.updateWithdrawalOrder(withdrawalId, {
    status: 'REJECTED',
    notes: {
      ...baseNotes,
      rejectedAt: new Date().toISOString(),
      reason: reason || 'Rejected by administrator',
    },
  })

  const user = await userModel.findById(withdrawal.userId)
  const amount = Number(withdrawal.amount || 0)
  const newBalance = Number(user.balance || 0) + totalDebit
  const totalWithdrawals = Math.max(0, Number(user.stats?.totalWithdrawals || 0) - amount)

  const updatedUser = await userModel.updateUser(user.id, {
    balance: newBalance,
    totalWithdrawals,
  })

  await userModel.updateStatementByWithdrawalId(user.id, withdrawal.id, {
    type: 'WITHDRAWAL_REJECTED',
    amount: -totalDebit,
    balanceAfter: Number(updatedUser.balance || newBalance),
    metadata: {
      ...baseNotes,
      withdrawalId: updated.id,
      destination: updated.destination,
      reason: reason || 'Rejected by administrator',
      status: updated.status,
      fee: feeAmount,
      totalDebit,
    },
  })

  await userModel.createStatement(user.id, {
    type: 'WITHDRAWAL_REFUND',
    amount: totalDebit,
    balanceAfter: Number(updatedUser.balance || newBalance),
    metadata: {
      withdrawalId: updated.id,
      destination: updated.destination,
      reason: reason || 'Rejected by administrator',
      fee: feeAmount,
      totalDebit,
    },
  })

  res.status(200).json({ withdrawal: updated })
})

const getUserDetail = asyncHandler(async (req, res) => {
  const { userId } = req.params
  if (!userId) {
    throw new AppError(400, 'User ID is required')
  }

  const user = await userModel.findById(userId)
  if (!user) {
    throw new AppError(404, 'User not found')
  }

  res.status(200).json({ user })
})

module.exports = {
  getMetrics,
  getSettings,
  updateSettings,
  listUsers,
  updateUserStatus,
  getUserTransactions,
  getTransactions,
  approveWithdrawal,
  rejectWithdrawal,
  completeSellOrder,
  rejectSellOrder,
  getUserDetail,
}
