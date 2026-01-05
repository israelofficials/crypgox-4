'use strict'

const { AppError } = require('../../utils/errors')
const userModel = require('../../models/user.model')
const withdrawalModel = require('../../models/withdrawal.model')

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

const normalizeBankDetails = (input = {}) => {
  const bank = {
    bankName: isNonEmptyString(input.bankName) ? input.bankName.trim() : null,
    accountHolderName: isNonEmptyString(input.accountHolderName) ? input.accountHolderName.trim() : null,
    accountNumber: isNonEmptyString(input.accountNumber) ? input.accountNumber.trim() : null,
    ifsc: isNonEmptyString(input.ifsc) ? input.ifsc.trim().toUpperCase() : null,
    branchName: isNonEmptyString(input.branchName) ? input.branchName.trim() : null,
    upiId: isNonEmptyString(input.upiId) ? input.upiId.trim() : null,
  }

  const hasBankAccount = bank.accountNumber && bank.ifsc && bank.accountHolderName
  const hasUpi = bank.upiId && bank.accountHolderName

  if (!hasBankAccount && !hasUpi) {
    throw new AppError(400, 'Valid bank account (account holder, account number, IFSC) or UPI ID with name is required')
  }

  return bank
}

const computeAmounts = ({ amount, rate, platformFeePercent, platformFeeAmount }) => {
  const amountUsdt = Number(amount)
  const rateInr = Number(rate)

  if (!Number.isFinite(amountUsdt) || amountUsdt <= 0) {
    throw new AppError(400, 'Sell quantity must be greater than zero')
  }

  if (!Number.isFinite(rateInr) || rateInr <= 0) {
    throw new AppError(400, 'Sell rate must be greater than zero')
  }

  const grossInr = amountUsdt * rateInr

  let feePercent = platformFeePercent !== undefined ? Number(platformFeePercent) : null
  if (feePercent !== null && (!Number.isFinite(feePercent) || feePercent < 0)) {
    throw new AppError(400, 'Platform fee percent must be a positive number')
  }

  let feeAmount = platformFeeAmount !== undefined ? Number(platformFeeAmount) : null
  if (feeAmount !== null && (!Number.isFinite(feeAmount) || feeAmount < 0)) {
    throw new AppError(400, 'Platform fee amount must be a positive number')
  }

  const usingDefaultFee = feePercent === null && feeAmount === null

  if (usingDefaultFee) {
    // default to 1%
    feePercent = 1
  }

  if (feeAmount === null && feePercent !== null) {
    feeAmount = (grossInr * feePercent) / 100
  }

  if (usingDefaultFee && amountUsdt < 1000) {
    const minimumFeeInr = 100
    if (feeAmount < minimumFeeInr) {
      feeAmount = grossInr > 0 ? Math.min(minimumFeeInr, grossInr) : 0
    }
  }

  if (feePercent === null && grossInr > 0) {
    feePercent = feeAmount === 0 ? 0 : (feeAmount / grossInr) * 100
  } else if (usingDefaultFee && grossInr > 0 && feeAmount !== null) {
    feePercent = feeAmount === 0 ? 0 : (feeAmount / grossInr) * 100
  }

  const netInr = grossInr - feeAmount

  return {
    amountUsdt,
    rateInr,
    grossInr,
    feeAmount,
    feePercent,
    netInr,
  }
}

const formatCurrency = (value) => Math.round(value * 100) / 100

const buildDestinationLabel = (bank) => {
  if (!bank || typeof bank !== 'object') {
    return 'Bank payout'
  }

  const candidates = [bank.upiId, bank.accountNumber, bank.accountHolderName, bank.bankName]
  const chosen = candidates.find((value) => typeof value === 'string' && value.trim())

  return chosen ? chosen.trim() : 'Bank payout'
}

const createSellOrder = async (userId, payload = {}) => {
  const { amount, rate, platformFeePercent, platformFeeAmount, bankDetails, notes } = payload

  const bank = normalizeBankDetails(bankDetails)
  const amounts = computeAmounts({ amount, rate, platformFeePercent, platformFeeAmount })

  const user = await userModel.findById(userId)
  if (!user) {
    throw new AppError(404, 'User not found')
  }

  if (amounts.amountUsdt > Number(user.balance || 0)) {
    throw new AppError(400, 'Insufficient USDT balance to create sell order')
  }

  const destinationLabel = buildDestinationLabel(bank)

  const now = new Date().toISOString()

  const metadata = {
    type: 'SELL',
    status: 'PENDING',
    amountUsdt: amounts.amountUsdt,
    rateInr: amounts.rateInr,
    grossInr: formatCurrency(amounts.grossInr),
    feePercent: amounts.feePercent,
    feeAmount: formatCurrency(amounts.feeAmount),
    netInr: formatCurrency(amounts.netInr),
    bank,
    history: [
      {
        status: 'PENDING',
        timestamp: now,
      },
    ],
    ...(notes && typeof notes === 'object' ? { notes } : {}),
  }

  const sellOrder = await withdrawalModel.createWithdrawalOrder({
    userId,
    amount: amounts.amountUsdt,
    destination: destinationLabel,
    notes: metadata,
  })

  const newBalance = Number(user.balance || 0) - amounts.amountUsdt
  const totalWithdrawals = Number(user.stats?.totalWithdrawals || 0) + amounts.amountUsdt

  await userModel.updateUser(userId, {
    balance: newBalance,
    totalWithdrawals,
  })

  await userModel.createStatement(userId, {
    type: 'SELL_ORDER',
    amount: -amounts.amountUsdt,
    balanceAfter: newBalance,
    metadata: {
      withdrawalId: sellOrder.id,
      amountUsdt: amounts.amountUsdt,
      rateInr: amounts.rateInr,
      grossInr: formatCurrency(amounts.grossInr),
      feeAmount: formatCurrency(amounts.feeAmount),
      feePercent: amounts.feePercent,
      netInr: formatCurrency(amounts.netInr),
      bank,
    },
  })

  return {
    ...sellOrder,
    metadata: {
      ...(sellOrder.notes || {}),
      ...metadata,
    },
  }
}

const withMetadata = (order) => {
  if (!order) return null
  const metadata = order.notes && typeof order.notes === 'object' ? order.notes : {}
  return {
    ...order,
    metadata,
  }
}

const listSellOrders = async (userId, { limit = 50 } = {}) => {
  const orders = await withdrawalModel.listSellOrdersByUser(userId, { limit })
  return orders.map(withMetadata)
}

const getSellOrder = async (userId, sellOrderId) => {
  const order = await withdrawalModel.findSellOrderById(userId, sellOrderId)
  if (!order) {
    throw new AppError(404, 'Sell order not found')
  }
  return withMetadata(order)
}

module.exports = {
  createSellOrder,
  listSellOrders,
  getSellOrder,
}
