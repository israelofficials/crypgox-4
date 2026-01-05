const withdrawalModel = require('../../models/withdrawal.model')
const walletModel = require('../../models/wallet.model')
const userModel = require('../../models/user.model')
const { AppError } = require('../../utils/errors')

const WITHDRAWAL_FEE_USDT = 1

const createWithdrawalOrder = async (userId, { amount, walletId, address, network, label }) => {
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new AppError(400, 'Withdrawal amount must be greater than zero')
  }

  const feeAmount = WITHDRAWAL_FEE_USDT
  const totalDebit = numericAmount + feeAmount

  const user = await userModel.findById(userId)
  if (!user) {
    throw new AppError(404, 'User not found')
  }

  if (totalDebit > Number(user.balance || 0)) {
    throw new AppError(400, 'Insufficient balance for withdrawal request')
  }

  let destination = typeof address === 'string' ? address.trim() : ''
  let resolvedNetwork = network
  let resolvedLabel = label
  let source = null

  if (walletId) {
    const wallet = await walletModel.findWalletById(walletId)
    if (!wallet || wallet.userId !== userId) {
      throw new AppError(404, 'Wallet not found')
    }

    source = wallet
    destination = wallet.address
    resolvedNetwork = wallet.network
    resolvedLabel = wallet.label
  }

  if (!destination) {
    throw new AppError(400, 'Withdrawal destination address is required')
  }

  const notes = {
    network: resolvedNetwork || 'TRC20',
    label: resolvedLabel || null,
    walletId: source ? source.id : null,
    fee: feeAmount,
    totalDebit,
  }

  const withdrawal = await withdrawalModel.createWithdrawalOrder({
    userId,
    amount: numericAmount,
    destination,
    notes,
  })

  const newBalance = Number(user.balance || 0) - totalDebit
  const totalWithdrawals = Number(user.stats?.totalWithdrawals || 0) + numericAmount

  await userModel.updateUser(userId, {
    balance: newBalance,
    totalWithdrawals,
  })

  await userModel.createStatement(userId, {
    type: 'WITHDRAWAL_REQUEST',
    amount: -totalDebit,
    balanceAfter: newBalance,
    metadata: {
      withdrawalId: withdrawal.id,
      destination,
      network: notes.network,
      requestedAmount: numericAmount,
      fee: feeAmount,
      totalDebit,
    },
  })

  return withdrawal
}

const listWithdrawals = async (userId, { limit = 20 } = {}) => {
  return withdrawalModel.listWithdrawalsByUser(userId, { limit })
}

const getWithdrawal = async (userId, withdrawalId) => {
  const withdrawal = await withdrawalModel.findWithdrawalById(withdrawalId)
  if (!withdrawal || withdrawal.userId !== userId) {
    throw new AppError(404, 'Withdrawal order not found')
  }
  return withdrawal
}

module.exports = {
  createWithdrawalOrder,
  listWithdrawals,
  getWithdrawal,
}
