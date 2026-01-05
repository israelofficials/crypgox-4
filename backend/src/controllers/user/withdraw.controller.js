const asyncHandler = require('../../utils/asyncHandler')
const { AppError } = require('../../utils/errors')
const withdrawService = require('../../services/user/withdraw.service')

const mapWithdrawalResponse = (withdrawal) => {
  if (!withdrawal) return null

  const metadata = withdrawal.notes && typeof withdrawal.notes === 'object' ? withdrawal.notes : null

  return {
    id: withdrawal.id,
    amount: withdrawal.amount,
    status: withdrawal.status,
    destination: withdrawal.destination,
    createdAt: withdrawal.createdAt,
    txId: withdrawal.txId || metadata?.txId || null,
    metadata,
  }
}

const createWithdrawalOrder = asyncHandler(async (req, res) => {
  const { amount, walletId, address, network, label } = req.body || {}

  if (amount === undefined || amount === null) {
    throw new AppError(400, 'Amount is required to create a withdrawal order')
  }

  const withdrawal = await withdrawService.createWithdrawalOrder(req.user.id, {
    amount,
    walletId,
    address,
    network,
    label,
  })

  res.status(201).json({ withdrawal: mapWithdrawalResponse(withdrawal) })
})

const listWithdrawals = asyncHandler(async (req, res) => {
  const { limit } = req.query
  const withdrawals = await withdrawService.listWithdrawals(req.user.id, { limit })

  res.status(200).json({ withdrawals: withdrawals.map(mapWithdrawalResponse) })
})

const getWithdrawal = asyncHandler(async (req, res) => {
  const { withdrawalId } = req.params
  const withdrawal = await withdrawService.getWithdrawal(req.user.id, withdrawalId)

  res.status(200).json({ withdrawal: mapWithdrawalResponse(withdrawal) })
})

module.exports = {
  createWithdrawalOrder,
  listWithdrawals,
  getWithdrawal,
}
