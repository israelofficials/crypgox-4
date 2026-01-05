const asyncHandler = require('../../utils/asyncHandler')
const { AppError } = require('../../utils/errors')
const depositService = require('../../services/user/deposit.service')

const mapDepositResponse = (deposit) => {
  if (!deposit) return null

  const metadata = deposit.notes && typeof deposit.notes === 'object' ? deposit.notes : null
  const depositAddress = metadata?.depositAddress ?? null
  const expiresAt = metadata?.expiresAt ?? null

  return {
    id: deposit.id,
    amount: deposit.amount,
    status: deposit.status,
    txId: deposit.txId,
    network: deposit.network,
    createdAt: deposit.createdAt,
    metadata,
    depositAddress,
    expiresAt,
  }
}

const createDepositOrder = asyncHandler(async (req, res) => {
  const { amount, network } = req.body || {}

  if (amount === undefined || amount === null) {
    throw new AppError(400, 'Amount is required to create a deposit order')
  }

  const deposit = await depositService.createDepositOrder(req.user.id, { amount, network })
  res.cookie('crypgo_deposit', JSON.stringify({ id: deposit.id, expiresAt: deposit.notes?.expiresAt ?? null }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: res.req.secure,
    maxAge: 2 * 60 * 60 * 1000,
  })
  res.status(201).json({ deposit: mapDepositResponse(deposit) })
})

const listDeposits = asyncHandler(async (req, res) => {
  const { limit } = req.query
  const deposits = await depositService.listDeposits(req.user.id, { limit })
  res.status(200).json({ deposits: deposits.map(mapDepositResponse) })
})

const getDeposit = asyncHandler(async (req, res) => {
  const { depositId } = req.params
  const deposit = await depositService.getDeposit(req.user.id, depositId)
  res.status(200).json({ deposit: mapDepositResponse(deposit) })
})

const cancelDeposit = asyncHandler(async (req, res) => {
  const { depositId } = req.params
  const deposit = await depositService.cancelDeposit(req.user.id, depositId)
  res.status(200).json({ deposit: mapDepositResponse(deposit) })
})

const verifyDeposit = asyncHandler(async (req, res) => {
  const { depositId } = req.params
  const { txId } = req.body || {}
  if (!txId) {
    throw new AppError(400, 'Transaction ID is required for verification')
  }

  const deposit = await depositService.verifyDeposit(req.user.id, depositId, txId)
  res.status(200).json({ deposit: mapDepositResponse(deposit) })
})

module.exports = {
  createDepositOrder,
  listDeposits,
  getDeposit,
  cancelDeposit,
  verifyDeposit,
}
