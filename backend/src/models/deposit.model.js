const { query } = require('../config/database')

const parseNotes = (value) => {
  if (!value) return null
  try {
    if (typeof value === 'object') return value
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

const mapDeposit = (row) => {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount || 0),
    status: row.status,
    txId: row.tx_id,
    network: row.network,
    notes: parseNotes(row.notes),
    createdAt: row.created_at,
  }
}

const createDepositOrder = async ({ userId, amount, network, notes }) => {
  const { rows } = await query(
    `INSERT INTO user_deposits (user_id, amount, status, network, notes)
     VALUES ($1, $2, 'PENDING', $3, $4)
     RETURNING id, user_id, amount, status, tx_id, network, notes, created_at`,
    [userId, amount, network ?? null, serializeNotes(notes)]
  )

  return mapDeposit(rows[0])
}

const updateDepositOrder = async (depositId, updates = {}) => {
  const allowedFields = {
    status: 'status',
    txId: 'tx_id',
    network: 'network',
    notes: 'notes',
  }

  const entries = Object.entries(updates).filter(([key, value]) => allowedFields[key] && value !== undefined)
  if (!entries.length) {
    const { rows } = await query(
      `SELECT id, user_id, amount, status, tx_id, network, notes, created_at
         FROM user_deposits
        WHERE id = $1`,
      [depositId]
    )
    return mapDeposit(rows[0])
  }

  const setFragments = entries.map(([key], index) => `${allowedFields[key]} = $${index + 2}`)
  const values = entries.map(([key, value]) => (key === 'notes' ? serializeNotes(value) : value))

  const { rows } = await query(
    `UPDATE user_deposits
        SET ${setFragments.join(', ')}
      WHERE id = $1
      RETURNING id, user_id, amount, status, tx_id, network, notes, created_at`,
    [depositId, ...values]
  )

  return mapDeposit(rows[0])
}

const findDepositById = async (depositId) => {
  const { rows } = await query(
    `SELECT id, user_id, amount, status, tx_id, network, notes, created_at
       FROM user_deposits
      WHERE id = $1
      LIMIT 1`,
    [depositId]
  )

  return mapDeposit(rows[0])
}

const listDepositsByUser = async (userId, { limit = 20 } = {}) => {
  const { rows } = await query(
    `SELECT id, user_id, amount, status, tx_id, network, notes, created_at
       FROM user_deposits
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2`,
    [userId, limit]
  )

  return rows.map(mapDeposit)
}

const findActiveDepositByUser = async (userId) => {
  const { rows } = await query(
    `SELECT id, user_id, amount, status, tx_id, network, notes, created_at
       FROM user_deposits
      WHERE user_id = $1
        AND status NOT IN ('COMPLETED', 'FAILED', 'CANCELLED')
      ORDER BY created_at DESC
      LIMIT 1`,
    [userId]
  )

  return mapDeposit(rows[0])
}

module.exports = {
  createDepositOrder,
  updateDepositOrder,
  findDepositById,
  listDepositsByUser,
  findActiveDepositByUser,
}
