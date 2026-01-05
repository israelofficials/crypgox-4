'use strict'

const { AppError } = require('../../utils/errors')
const payeeModel = require('../../models/payee.model')

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '')

const validatePayload = ({ name, upiId, bankName, accountNumber, ifsc }) => {
  const trimmedName = normalizeString(name)
  const trimmedUpi = normalizeString(upiId)
  const trimmedAccount = normalizeString(accountNumber)
  const trimmedIfsc = normalizeString(ifsc)
  const trimmedBankName = normalizeString(bankName)

  const hasUpi = Boolean(trimmedUpi)
  const hasBank = Boolean(trimmedAccount) && Boolean(trimmedIfsc)

  if (!hasUpi && !hasBank) {
    throw new AppError(400, 'Provide either a UPI ID or bank account with IFSC')
  }

  if (hasBank && !trimmedName) {
    throw new AppError(400, 'Account holder name is required for bank payouts')
  }

  const resolvedName = trimmedName || (hasUpi ? trimmedUpi : '')

  if (!resolvedName) {
    throw new AppError(400, 'Beneficiary name is required')
  }

  return {
    name: resolvedName,
    upiId: hasUpi ? trimmedUpi : null,
    bankName: trimmedBankName || null,
    accountNumber: hasBank ? trimmedAccount : null,
    ifsc: hasBank ? trimmedIfsc.toUpperCase() : null,
  }
}

const listPayees = async (userId) => {
  return payeeModel.listPayeesByUser(userId)
}

const createPayee = async (userId, payload) => {
  const normalized = validatePayload(payload)
  return payeeModel.createPayee({ userId, ...normalized })
}

const deletePayee = async (userId, payeeId) => {
  if (!payeeId) {
    throw new AppError(400, 'Payee reference missing')
  }

  const payee = await payeeModel.deletePayee(userId, payeeId)
  if (!payee) {
    throw new AppError(404, 'Payee not found')
  }

  return payee
}

module.exports = {
  listPayees,
  createPayee,
  deletePayee,
}
