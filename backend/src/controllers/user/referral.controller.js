'use strict'

const asyncHandler = require('../../utils/asyncHandler')
const { redeemReferralRewards } = require('../../services/user/referral.service')

const redeemRewards = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const result = await redeemReferralRewards(userId)
  res.status(200).json(result)
})

module.exports = {
  redeemRewards,
}
