const asyncHandler = require('../../utils/asyncHandler')
const { AppError } = require('../../utils/errors')
const walletService = require('../../services/user/wallet.service')

const createWallet = asyncHandler(async (req, res) => {
  const { address, network, label } = req.body || {}
  const wallet = await walletService.createWallet(req.user.id, { address, network, label })
  res.status(201).json({ wallet })
})

const listWallets = asyncHandler(async (req, res) => {
  const wallets = await walletService.listWallets(req.user.id)
  res.status(200).json({ wallets })
})

const deleteWallet = asyncHandler(async (req, res) => {
  const { walletId } = req.params
  if (!walletId) {
    throw new AppError(400, 'Wallet reference missing')
  }

  await walletService.deleteWallet(req.user.id, walletId)
  res.status(204).send()
})

module.exports = {
  createWallet,
  listWallets,
  deleteWallet,
}
