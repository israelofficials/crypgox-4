const { query } = require('../config/database')

const parseNotes = (value) => {
  if (!value) return null
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch (error) {
    return { raw: value }
  }
}

const serializeNotes = (notes) => {
  if (!notes || (typeof notes === 'object' && Object.keys(notes).length === 0)) {
    return null
  }

  return typeof notes === 'string' ? notes : JSON.stringify(notes)
}

const mapWithdrawal = (row) => {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount || 0),
    status: row.status,
    destination: row.destination,
    txId: row.tx_id,
    notes: parseNotes(row.notes),
    createdAt: row.created_at,
  }
}

const buildDateClauses = (alias, { startDate, endDate }) => {
  const clauses = []
  const params = []

  if (startDate) {
    params.push(startDate)
    clauses.push(`${alias}.created_at >= $${params.length}`)
  }

  if (endDate) {
    params.push(endDate)
    clauses.push(`${alias}.created_at <= $${params.length}`)
  }

  return { clauses, params }
}

const createWithdrawalOrder = async ({ userId, amount, destination, notes }) => {
  const { rows } = await query(
    `INSERT INTO user_withdrawals (user_id, amount, status, destination, notes)
       VALUES ($1, $2, 'PENDING', $3, $4)
     RETURNING id, user_id, amount, status, destination, tx_id, notes, created_at`,
    [userId, amount, destination ?? null, serializeNotes(notes)]
  )

  return mapWithdrawal(rows[0])
}

const updateWithdrawalOrder = async (withdrawalId, updates = {}) => {
  const allowedFields = {
    status: 'status',
    destination: 'destination',
    notes: 'notes',
    txId: 'tx_id',
  }

  const entries = Object.entries(updates).filter(([key, value]) => allowedFields[key] && value !== undefined)
  if (!entries.length) {
    const { rows } = await query(
      `SELECT id, user_id, amount, status, destination, tx_id, notes, created_at
         FROM user_withdrawals
        WHERE id = $1`,
      [withdrawalId]
    )
    return mapWithdrawal(rows[0])
  }

  const setFragments = entries.map(([key], index) => `${allowedFields[key]} = $${index + 2}`)
  const values = entries.map(([key, value]) => (key === 'notes' ? serializeNotes(value) : value))

  const { rows } = await query(
    `UPDATE user_withdrawals
        SET ${setFragments.join(', ')}
      WHERE id = $1
      RETURNING id, user_id, amount, status, destination, tx_id, notes, created_at`,
    [withdrawalId, ...values]
  )

  return mapWithdrawal(rows[0])
}

const findWithdrawalById = async (withdrawalId) => {
  const { rows } = await query(
    `SELECT id, user_id, amount, status, destination, tx_id, notes, created_at
       FROM user_withdrawals
      WHERE id = $1
      LIMIT 1`,
    [withdrawalId]
  )

  return mapWithdrawal(rows[0])
}

const listWithdrawalsByUser = async (userId, { limit = 20 } = {}) => {
  const { rows } = await query(
    `SELECT id, user_id, amount, status, destination, tx_id, notes, created_at
       FROM user_withdrawals
      WHERE user_id = $1
        AND (notes IS NULL OR (notes::jsonb->>'type') IS DISTINCT FROM 'SELL')
      ORDER BY created_at DESC
      LIMIT $2`,
    [userId, limit]
  )

  return rows.map(mapWithdrawal)
}

const listSellOrdersByUser = async (userId, { limit = 50 } = {}) => {
  const { rows } = await query(
    `SELECT id, user_id, amount, status, destination, tx_id, notes, created_at
       FROM user_withdrawals
      WHERE user_id = $1
        AND (notes::jsonb->>'type') = 'SELL'
      ORDER BY created_at DESC
      LIMIT $2`,
    [userId, limit]
  )

  return rows.map(mapWithdrawal)
}

const findSellOrderById = async (userId, sellOrderId) => {
  const { rows } = await query(
    `SELECT id, user_id, amount, status, destination, tx_id, notes, created_at
       FROM user_withdrawals
      WHERE id = $1
        AND user_id = $2
        AND (notes::jsonb->>'type') = 'SELL'
      LIMIT 1`,
    [sellOrderId, userId]
  )

  return mapWithdrawal(rows[0])
}

const findSellOrderByIdRaw = async (sellOrderId) => {
  const { rows } = await query(
    `SELECT id, user_id, amount, status, destination, tx_id, notes, created_at
       FROM user_withdrawals
      WHERE id = $1
        AND (notes::jsonb->>'type') = 'SELL'
      LIMIT 1`,
    [sellOrderId]
  )

  return mapWithdrawal(rows[0])
}

const listSellOrders = async ({ limit = 100, startDate, endDate } = {}) => {
  const { clauses, params } = buildDateClauses('w', { startDate, endDate })
  const whereParts = [`(w.notes::jsonb->>'type') = 'SELL'`, ...clauses]
  const limitParamIndex = params.length + 1

  const { rows } = await query(
    `SELECT w.id,
            w.user_id,
            w.amount,
            w.status,
            w.destination,
            w.tx_id,
            w.notes,
            w.created_at,
            u.phone,
            u.name
       FROM user_withdrawals w
       JOIN users u ON u.id = w.user_id
      WHERE ${whereParts.join(' AND ')}
      ORDER BY w.created_at DESC
      LIMIT $${limitParamIndex}`,
    [...params, limit]
  )

  return rows.map((row) => ({
    ...mapWithdrawal(row),
    userPhone: row.phone,
    userName: row.name,
  }))
}

module.exports = {
  createWithdrawalOrder,
  updateWithdrawalOrder,
  findWithdrawalById,
  listWithdrawalsByUser,
  listSellOrdersByUser,
  findSellOrderById,
  findSellOrderByIdRaw,
  listSellOrders,
}
