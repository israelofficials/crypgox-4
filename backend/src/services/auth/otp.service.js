const crypto = require('crypto')
const env = require('../../config/env')
const logger = require('../../utils/logger')
const { query } = require('../../config/database')
const messageCentralService = require('../messageCentral.service')

const { MESSAGE_CENTRAL_PROVIDER } = messageCentralService

const LOCAL_PROVIDER = 'local'
const OTP_LENGTH = 4

const generateRandomOtp = () => crypto.randomInt(1000, 9999).toString()

const determineProvider = (phone) => {
  if (env.nodeEnv !== 'production' && phone === env.otp.whitelist.phone) {
    return LOCAL_PROVIDER
  }

  if (messageCentralService.isConfigured()) {
    return MESSAGE_CENTRAL_PROVIDER
  }

  return LOCAL_PROVIDER
}

const fetchOtpRow = async (phone) => {
  const { rows } = await query('SELECT * FROM otps WHERE phone = $1 LIMIT 1', [phone])
  return rows[0] || null
}

const deleteOtp = async (phone) => {
  await query('DELETE FROM otps WHERE phone = $1', [phone])
}

const requestOtp = async (phone) => {
  const existing = await fetchOtpRow(phone)
  const now = new Date()

  if (existing && existing.resend_available_at && new Date(existing.resend_available_at) > now) {
    const secondsLeft = Math.ceil((new Date(existing.resend_available_at).getTime() - now.getTime()) / 1000)
    return { status: 'cooldown', secondsLeft }
  }

  const provider = determineProvider(phone)
  const resendAvailableAt = new Date(now.getTime() + env.otp.resendCooldownSeconds * 1000)

  let otp = null
  let verificationId = null
  let expiresAt = new Date(now.getTime() + env.otp.expirySeconds * 1000)

  if (provider === MESSAGE_CENTRAL_PROVIDER) {
    const response = await messageCentralService.sendOtp({ phone, otpLength: OTP_LENGTH })
    verificationId = response.verificationId

    if (response.timeoutSeconds && Number.isFinite(response.timeoutSeconds)) {
      expiresAt = new Date(now.getTime() + response.timeoutSeconds * 1000)
    }
  } else {
    otp = phone === env.otp.whitelist.phone ? env.otp.whitelist.code : generateRandomOtp()
  }

  const { rows } = await query(
    `INSERT INTO otps (phone, otp, provider, verification_id, created_at, expires_at, resend_available_at, attempts, verified)
     VALUES ($1, $2, $3, $4, NOW(), $5, $6, 0, FALSE)
     ON CONFLICT (phone) DO UPDATE SET
       otp = EXCLUDED.otp,
       provider = EXCLUDED.provider,
       verification_id = EXCLUDED.verification_id,
       created_at = NOW(),
       expires_at = EXCLUDED.expires_at,
       resend_available_at = EXCLUDED.resend_available_at,
       attempts = 0,
       verified = FALSE
     RETURNING otp, expires_at, resend_available_at, provider, verification_id`,
    [phone, otp, provider, verificationId, expiresAt, resendAvailableAt]
  )

  const entry = rows[0]
  logger.debug('OTP request stored for %s via %s (expires at %s)', phone, entry.provider || LOCAL_PROVIDER, entry.expires_at)

  return {
    status: 'created',
    otp: entry.otp,
    expiresAt: new Date(entry.expires_at).getTime(),
    provider: entry.provider || LOCAL_PROVIDER,
    verificationId: entry.verification_id || null,
  }
}

const verifyOtp = async (phone, otp) => {
  const entry = await fetchOtpRow(phone)
  if (!entry) {
    return { success: false, reason: 'not_requested' }
  }

  const now = new Date()
  const expiresAt = new Date(entry.expires_at)

  if (entry.verified) {
    await deleteOtp(phone)
    return { success: false, reason: 'already_used' }
  }

  if (now > expiresAt) {
    await deleteOtp(phone)
    return { success: false, reason: 'expired' }
  }

  if (entry.attempts >= env.otp.maxAttempts) {
    await deleteOtp(phone)
    return { success: false, reason: 'max_attempts' }
  }

  if (entry.provider === MESSAGE_CENTRAL_PROVIDER) {
    if (!entry.verification_id) {
      await deleteOtp(phone)
      return { success: false, reason: 'invalid' }
    }

    const result = await messageCentralService.validateOtp({
      phone,
      verificationId: entry.verification_id,
      code: otp,
    })

    if (result.success) {
      await deleteOtp(phone)
      return { success: true }
    }

    if (result.reason === 'expired' || result.reason === 'already_used') {
      await deleteOtp(phone)
      return { success: false, reason: result.reason }
    }

    await query('UPDATE otps SET attempts = attempts + 1 WHERE phone = $1', [phone])

    if (entry.attempts + 1 >= env.otp.maxAttempts) {
      await deleteOtp(phone)
      return { success: false, reason: 'max_attempts' }
    }

    return { success: false, reason: result.reason || 'invalid' }
  }

  if (entry.otp !== otp) {
    await query('UPDATE otps SET attempts = attempts + 1 WHERE phone = $1', [phone])
    return { success: false, reason: 'invalid' }
  }

  await deleteOtp(phone)
  return { success: true }
}

module.exports = {
  requestOtp,
  verifyOtp,
}
