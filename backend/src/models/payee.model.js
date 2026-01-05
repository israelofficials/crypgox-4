const { query } = require('../config/database')

const mapPayee = (row) => {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    upiId: row.upi_id,
    bankName: row.bank_name,
    accountNumber: row.account_number,
    ifsc: row.ifsc,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const listPayeesByUser = async (userId) => {
  const { rows } = await query(
    `SELECT id, user_id, name, upi_id, bank_name, account_number, ifsc, created_at, updated_at
       FROM user_payees
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId]
  )

  return rows.map(mapPayee)
}

const createPayee = async ({ userId, name, upiId, bankName, accountNumber, ifsc }) => {
  const { rows } = await query(
    `INSERT INTO user_payees (user_id, name, upi_id, bank_name, account_number, ifsc)
       VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, name, upi_id, bank_name, account_number, ifsc, created_at, updated_at`,
    [userId, name, upiId || null, bankName || null, accountNumber || null, ifsc || null]
  )

  return mapPayee(rows[0])
}

const findPayeeById = async (payeeId) => {
  const { rows } = await query(
    `SELECT id, user_id, name, upi_id, bank_name, account_number, ifsc, created_at, updated_at
       FROM user_payees
      WHERE id = $1
      LIMIT 1`,
    [payeeId]
  )

  return mapPayee(rows[0])
}

const deletePayee = async (userId, payeeId) => {
  const { rows } = await query(
    `DELETE FROM user_payees
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id, name, upi_id, bank_name, account_number, ifsc, created_at, updated_at`,
    [payeeId, userId]
  )

  return mapPayee(rows[0])
}

module.exports = {
  listPayeesByUser,
  createPayee,
  findPayeeById,
  deletePayee,
}
