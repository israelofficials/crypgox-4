const asyncHandler = require('../../utils/asyncHandler')
const payeeService = require('../../services/user/payee.service')

const mapPayeeResponse = (payee) => {
  if (!payee) return null
  return {
    id: payee.id,
    name: payee.name,
    upiId: payee.upiId,
    bankName: payee.bankName,
    accountNumber: payee.accountNumber,
    ifsc: payee.ifsc,
    createdAt: payee.createdAt,
    updatedAt: payee.updatedAt,
  }
}

const listPayees = asyncHandler(async (req, res) => {
  const payees = await payeeService.listPayees(req.user.id)
  res.status(200).json({ payees: payees.map(mapPayeeResponse) })
})

const createPayee = asyncHandler(async (req, res) => {
  const payload = req.body || {}
  const payee = await payeeService.createPayee(req.user.id, payload)
  res.status(201).json({ payee: mapPayeeResponse(payee) })
})

const deletePayee = asyncHandler(async (req, res) => {
  const { payeeId } = req.params
  const payee = await payeeService.deletePayee(req.user.id, payeeId)
  res.status(200).json({ payee: mapPayeeResponse(payee) })
})

module.exports = {
  listPayees,
  createPayee,
  deletePayee,
}
