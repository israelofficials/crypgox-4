'use strict'

const userModel = require('../../models/user.model')
const referralModel = require('../../models/referral.model')
const { REFERRAL_PAYOUT_THRESHOLD_INR } = require('../../constants')
const { AppError } = require('../../utils/errors')

const roundToPaise = (value) => {
  return Math.max(0, Math.round(Number(value || 0) * 100) / 100)
}

const redeemReferralRewards = async (userId) => {
  const invites = await userModel.listInvitesByUser(userId)

  if (!invites.length) {
    throw new AppError(400, 'You have not earned any referral rewards yet')
  }

  const totalReward = invites.reduce((sum, invite) => sum + Number(invite.reward || 0), 0)
  const redeemedReward = invites.reduce((sum, invite) => sum + Number(invite.rewardRedeemed || 0), 0)
  const availableReward = roundToPaise(totalReward - redeemedReward)

  if (availableReward <= 0) {
    throw new AppError(400, 'No referral rewards available to redeem')
  }

  if (availableReward < REFERRAL_PAYOUT_THRESHOLD_INR) {
    throw new AppError(400, `Minimum redeemable referral balance is ₹${REFERRAL_PAYOUT_THRESHOLD_INR}`)
  }

  const amount = roundToPaise(availableReward)

  const updatedUser = await userModel.redeemInviteReward({ userId, amount })

  await referralModel.createPayout({
    referrerId: userId,
    amount,
    metadata: {
      type: 'BALANCE_CREDIT',
      invitesRedeemed: invites
        .filter((invite) => Number(invite.reward || 0) > Number(invite.rewardRedeemed || 0))
        .map((invite) => invite.id),
    },
  })

  const refreshedProfile = await userModel.getUserProfile(userId)

  return {
    amount,
    user: refreshedProfile,
  }
}

module.exports = {
  redeemReferralRewards,
}
