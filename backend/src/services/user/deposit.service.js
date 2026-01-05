const axios = require('axios')

const env = require('../../config/env')
const depositModel = require('../../models/deposit.model')
const platformSettingsModel = require('../../models/platformSettings.model')
const userModel = require('../../models/user.model')
const referralModel = require('../../models/referral.model')
const { AppError } = require('../../utils/errors')

const TWO_HOURS_MS = 2 * 60 * 60 * 1000
const TRON_API_BASE = 'https://nile.trongrid.io'

const appendNoteEvent = (notes, event) => {
  const base = notes && typeof notes === 'object' ? { ...notes } : {}
  const events = Array.isArray(base.events) ? [...base.events] : []
  events.push({ ...event, timestamp: new Date().toISOString() })
  return { ...base, events }
}

const ensureDepositOwnership = async (userId, depositId) => {
  const deposit = await depositModel.findDepositById(depositId)
  if (!deposit) {
    throw new AppError(404, 'Deposit order not found')
  }
  if (deposit.userId !== userId) {
    throw new AppError(403, 'You do not have access to this deposit order')
  }
  return deposit
}

const selectDepositAddress = (settings) => {
  if (!settings || !Array.isArray(settings.depositAddresses) || settings.depositAddresses.length === 0) {
    return null
  }

  const addresses = settings.depositAddresses.filter((address) => typeof address === 'string' && address.trim())
  if (!addresses.length) {
    return null
  }

  if (addresses.length === 1) {
    return addresses[0]
  }

  const index = Math.floor(Math.random() * addresses.length)
  return addresses[index]
}

const createDepositOrder = async (userId, { amount, network = 'TRC20' }) => {
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new AppError(400, 'Deposit amount must be greater than zero')
  }

  const existingActive = await depositModel.findActiveDepositByUser(userId)
  if (existingActive) {
    throw new AppError(409, 'You already have an active deposit order. Complete or cancel it before creating a new one.')
  }

  const settings = await platformSettingsModel.getSettings()
  const depositAddress = selectDepositAddress(settings)
  if (!depositAddress) {
    throw new AppError(500, 'Deposit address is not configured')
  }

  const expiresAt = new Date(Date.now() + TWO_HOURS_MS).toISOString()

  const notes = appendNoteEvent(
    {
      depositAddress,
      expiresAt,
      network,
      amount: numericAmount,
    },
    { status: 'PENDING' }
  )

  const deposit = await depositModel.createDepositOrder({
    userId,
    amount: numericAmount,
    network,
    notes,
  })

  return deposit
}

const listDeposits = async (userId, { limit = 20 } = {}) => {
  return depositModel.listDepositsByUser(userId, { limit: Number(limit) || 20 })
}

const getDeposit = async (userId, depositId) => {
  return ensureDepositOwnership(userId, depositId)
}

const cancelDeposit = async (userId, depositId) => {
  const deposit = await ensureDepositOwnership(userId, depositId)

  if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(deposit.status)) {
    throw new AppError(400, `Cannot cancel a deposit that is ${deposit.status}`)
  }

  const updatedNotes = appendNoteEvent(deposit.notes, { status: 'CANCELLED', actor: 'USER' })

  const updated = await depositModel.updateDepositOrder(depositId, {
    status: 'CANCELLED',
    notes: updatedNotes,
  })

  return updated
}

const fetchTronTransaction = async (txId) => {
  if (!env.tron.apiKey) {
    throw new AppError(500, 'TronGrid API key is not configured')
  }

  try {
    const { data } = await axios.post(
      `${TRON_API_BASE}/wallet/gettransactionbyid`,
      { value: txId },
      {
        headers: {
          'Content-Type': 'application/json',
          'TRON-PRO-API-KEY': env.tron.apiKey,
        },
        timeout: 10_000,
      }
    )

    return data
  } catch (error) {
    throw new AppError(202, 'Verification pending on blockchain propagation. Please retry in a minute.')
  }
}

const verifyDeposit = async (userId, depositId, txId) => {
  const trimmedTxId = typeof txId === 'string' ? txId.trim() : ''
  if (!trimmedTxId) {
    throw new AppError(400, 'Transaction ID is required for verification')
  }

  const deposit = await ensureDepositOwnership(userId, depositId)

  if (deposit.status === 'COMPLETED') {
    return deposit
  }
  if (deposit.status === 'CANCELLED') {
    throw new AppError(400, 'Cannot verify a cancelled deposit')
  }

  const tronData = await fetchTronTransaction(trimmedTxId)
  const hasResult = tronData && Object.keys(tronData).length > 0
  const retList = Array.isArray(tronData?.ret) ? tronData.ret : []
  const successRet = retList.find((entry) => entry.contractRet === 'SUCCESS')
  if (!hasResult) {
    throw new AppError(202, 'Verification pending on blockchain propagation. Please retry in a minute.')
  }

  const verificationStatus = hasResult && successRet ? 'COMPLETED' : 'PENDING'

  const updatedNotes = appendNoteEvent(deposit.notes, {
    status: hasResult && successRet ? 'VERIFIED' : 'VERIFICATION_PENDING',
    txId: trimmedTxId,
    success: hasResult && !!successRet,
  })

  const updatePayload = {
    txId: trimmedTxId,
    notes: { ...updatedNotes, tronCheck: { success: !!successRet } },
  }

  if (verificationStatus === 'COMPLETED') {
    updatePayload.status = 'COMPLETED'
  }

  const updatedDeposit = await depositModel.updateDepositOrder(depositId, updatePayload)

  if (verificationStatus === 'COMPLETED') {
    const user = await userModel.findById(userId)
    if (!user) {
      throw new AppError(404, 'User not found')
    }

    const newBalance = Number(user.balance || 0) + Number(updatedDeposit.amount)
    const totalDeposits = Number(user.stats?.totalDeposits || 0) + Number(updatedDeposit.amount)

    await userModel.updateUser(userId, {
      balance: newBalance,
      totalDeposits,
    })

    await userModel.createStatement(userId, {
      type: 'DEPOSIT',
      amount: updatedDeposit.amount,
      balanceAfter: newBalance,
      metadata: {
        txId: trimmedTxId,
        network: updatedDeposit.network,
      },
    })

    if (user.referredBy) {
      const referrer = await userModel.findById(user.referredBy)
      if (referrer) {
        const settings = await platformSettingsModel.getSettings()
        const commissionRate = Number(settings?.inviteCommission ?? 0)

        if (commissionRate > 0) {
          const commissionAmount = Number((Number(updatedDeposit.amount) * commissionRate) / 100)

          if (commissionAmount > 0) {
            const existingInvite = await userModel.findInviteByInviteeUserId(user.id)
            let inviteRecord

            if (existingInvite) {
              if (existingInvite.status !== 'COMPLETED') {
                await userModel.updateInvite(existingInvite.id, {
                  status: 'COMPLETED',
                })
              }
              inviteRecord = await userModel.addRewardToInvite(existingInvite.id, commissionAmount)
            } else {
              inviteRecord = await userModel.createInvite(referrer.id, {
                inviteePhone: user.phone,
                inviteeUserId: user.id,
                status: 'COMPLETED',
                reward: commissionAmount,
              })
            }

            await referralModel.createReward({
              referrerId: referrer.id,
              inviteId: inviteRecord.id,
              depositId: updatedDeposit.id,
              amount: commissionAmount,
              commissionRate,
            })
          }
        }
      }
    }
  }

  return updatedDeposit
}

module.exports = {
  createDepositOrder,
  listDeposits,
  getDeposit,
  cancelDeposit,
  verifyDeposit,
}
