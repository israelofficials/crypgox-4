const env = require('../../config/env')
const { requestOtpSchema, verifyOtpSchema } = require('../../utils/validators')
const asyncHandler = require('../../utils/asyncHandler')
const { AppError } = require('../../utils/errors')
const otpService = require('../../services/auth/otp.service')
const { signToken } = require('../../services/auth/jwt.service')
const {
  createUser,
  findByPhone,
  touchLastLogin,
  getUserProfile,
  updateUser,
  findByInviteCode,
  createInvite,
  findInviteByInviteePhone,
  updateInvite,
} = require('../../models/user.model')
const platformSettingsModel = require('../../models/platformSettings.model')
const { COOKIE_NAMES } = require('../../constants')

const MIN_PAYOUT_THRESHOLD = 500

const mapVerificationError = (reason) => {
  switch (reason) {
    case 'expired':
      return new AppError(400, 'OTP has expired')
    case 'invalid':
      return new AppError(400, 'OTP is invalid')
    case 'max_attempts':
      return new AppError(429, 'Too many attempts, please request a new OTP')
    case 'already_used':
      return new AppError(400, 'OTP already used, request a new one')
    case 'not_requested':
      return new AppError(400, 'OTP not requested for this number')
    default:
      return new AppError(400, 'Unable to verify OTP')
  }
}

const handleValidation = (schema, data) => {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new AppError(400, 'Validation failed', parsed.error.flatten().fieldErrors)
  }
  return parsed.data
}

const requestOtp = asyncHandler(async (req, res) => {
  const { phone } = handleValidation(requestOtpSchema, req.body)

  const existingUser = await findByPhone(phone)
  const result = await otpService.requestOtp(phone)
  if (result.status === 'cooldown') {
    throw new AppError(429, 'Please wait before requesting another OTP', {
      secondsLeft: result.secondsLeft,
    })
  }

  const requiresName = !existingUser || !(existingUser.name && existingUser.name.trim())

  const response = {
    message: 'OTP sent successfully',
    expiresAt: result.expiresAt,
    requiresName,
  }

  if (phone === env.otp.whitelist.phone && env.nodeEnv !== 'production') {
    response.devOtp = result.otp
  }

  res.status(200).json(response)
})

const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp, name, referralCode } = handleValidation(verifyOtpSchema, req.body)
  const verification = await otpService.verifyOtp(phone, otp)

  if (!verification.success) {
    throw mapVerificationError(verification.reason)
  }

  const trimmedName = name?.trim()

  const trimmedReferral = typeof referralCode === 'string' ? referralCode.trim().toUpperCase() : null

  let baseUser = await findByPhone(phone)
  if (!baseUser) {
    const referrer = trimmedReferral ? await findByInviteCode(trimmedReferral) : null
    baseUser = await createUser(phone, {
      name: trimmedName || null,
      referredBy: referrer ? referrer.id : null,
    })

    if (referrer) {
      const existingInvite = await findInviteByInviteePhone(phone)
      if (existingInvite) {
        await updateInvite(existingInvite.id, {
          inviteeUserId: baseUser.id,
          status: 'COMPLETED',
        })
      } else {
        await createInvite(referrer.id, {
          inviteePhone: phone,
          inviteeUserId: baseUser.id,
          status: 'COMPLETED',
        })
      }
    }
  } else {
    if (trimmedName && trimmedName !== baseUser.name) {
      await updateUser(baseUser.id, { name: trimmedName })
    }
    baseUser = await touchLastLogin(baseUser.id)
  }

  const token = signToken({ sub: baseUser.id, role: baseUser.role })

  const user = await getUserProfile(baseUser.id)

  res.cookie(COOKIE_NAMES.AUTH_TOKEN, token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60 * 1000,
  })

  const settings = await platformSettingsModel.getSettings()

  res.status(200).json({
    token,
    user,
    settings,
  })
})

const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id)
  const settings = req.platformSettings || (await platformSettingsModel.getSettings())

  res.json({ user, settings })
})

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAMES.AUTH_TOKEN, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
  })

  res.status(200).json({ message: 'Logged out successfully' })
})

module.exports = {
  requestOtp,
  verifyOtp,
  getProfile,
  logout,
}
