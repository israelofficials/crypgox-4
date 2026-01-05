const { query } = require('../config/database')

const mapWallet = (row) => {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    address: row.address,
    network: row.network,
    label: row.label,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const createWallet = async ({ userId, address, network = 'TRC20', label = null }) => {
  const { rows } = await query(
    `INSERT INTO user_wallets (user_id, address, network, label)
       VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, address) DO UPDATE
         SET network = EXCLUDED.network,
             label = COALESCE(EXCLUDED.label, user_wallets.label),
             updated_at = NOW()
     RETURNING id, user_id, address, network, label, created_at, updated_at`,
    [userId, address, network, label]
  )

  return mapWallet(rows[0])
}

const listWalletsByUser = async (userId) => {
  const { rows } = await query(
    `SELECT id, user_id, address, network, label, created_at, updated_at
       FROM user_wallets
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId]
  )

  return rows.map(mapWallet)
}

const findWalletById = async (walletId) => {
  const { rows } = await query(
    `SELECT id, user_id, address, network, label, created_at, updated_at
       FROM user_wallets
      WHERE id = $1
      LIMIT 1`,
    [walletId]
  )

  return mapWallet(rows[0])
}

const deleteWallet = async (userId, walletId) => {
  const { rows } = await query(
    `DELETE FROM user_wallets
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id, address, network, label, created_at, updated_at`,
    [walletId, userId]
  )

  return mapWallet(rows[0])
}

module.exports = {
  createWallet,
  listWalletsByUser,
  findWalletById,
  deleteWallet,
}
