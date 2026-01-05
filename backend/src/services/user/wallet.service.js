const walletModel = require('../../models/wallet.model')
const { AppError } = require('../../utils/errors')

const createWallet = async (userId, { address, network = 'TRC20', label }) => {
  const trimmedAddress = typeof address === 'string' ? address.trim() : ''
  if (!trimmedAddress) {
    throw new AppError(400, 'Wallet address is required')
  }

  const normalizedNetwork = typeof network === 'string' && network.trim() ? network.trim().toUpperCase() : 'TRC20'
  const normalizedLabel = typeof label === 'string' && label.trim() ? label.trim() : null

  const wallet = await walletModel.createWallet({
    userId,
    address: trimmedAddress,
    network: normalizedNetwork,
    label: normalizedLabel,
  })

  return wallet
}

const listWallets = async (userId) => {
  return walletModel.listWalletsByUser(userId)
}

const deleteWallet = async (userId, walletId) => {
  const wallet = await walletModel.deleteWallet(userId, walletId)
  if (!wallet) {
    throw new AppError(404, 'Wallet not found')
  }
  return wallet
}

module.exports = {
  createWallet,
  listWallets,
  deleteWallet,
}
