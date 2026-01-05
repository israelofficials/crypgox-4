const asyncHandler = require('../../utils/asyncHandler')
const { AppError } = require('../../utils/errors')
const sellService = require('../../services/user/sell.service')

const mapSellOrderResponse = (order) => {
  if (!order) return null

  const metadata = order.metadata && typeof order.metadata === 'object' ? order.metadata : order.notes || {}
  const history = Array.isArray(metadata?.history) ? metadata.history : []
  const bank = metadata?.bank || null

  return {
    id: order.id,
    amountUsdt: order.amount || metadata?.amountUsdt || 0,
    status: metadata?.status || order.status,
    destination: order.destination,
    createdAt: order.createdAt,
    txId: order.txId || metadata?.txId || null,
    rateInr: metadata?.rateInr ?? null,
    grossInr: metadata?.grossInr ?? null,
    netInr: metadata?.netInr ?? null,
    feeAmount: metadata?.feeAmount ?? null,
    feePercent: metadata?.feePercent ?? null,
    bank,
    history,
    metadata,
  }
}

const createSellOrder = asyncHandler(async (req, res) => {
  const { amount, rate, platformFeePercent, platformFeeAmount, bankDetails, notes } = req.body || {}

  if (amount === undefined || amount === null) {
    throw new AppError(400, 'Sell quantity (amount) is required')
  }

  if (rate === undefined || rate === null) {
    throw new AppError(400, 'Sell rate is required')
  }

  const sellOrder = await sellService.createSellOrder(req.user.id, {
    amount,
    rate,
    platformFeePercent,
    platformFeeAmount,
    bankDetails,
    notes,
  })

  res.status(201).json({ sellOrder: mapSellOrderResponse(sellOrder) })
})

const listSellOrders = asyncHandler(async (req, res) => {
  const { limit } = req.query
  const orders = await sellService.listSellOrders(req.user.id, {
    limit: limit ? Number(limit) : undefined,
  })

  res.status(200).json({ sellOrders: orders.map(mapSellOrderResponse) })
})

const getSellOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params
  const order = await sellService.getSellOrder(req.user.id, orderId)

  res.status(200).json({ sellOrder: mapSellOrderResponse(order) })
})

module.exports = {
  createSellOrder,
  listSellOrders,
  getSellOrder,
}
