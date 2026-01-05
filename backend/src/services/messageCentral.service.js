'use strict'

const axios = require('axios')

const env = require('../config/env')
const { AppError } = require('../utils/errors')
const logger = require('../utils/logger')

const MESSAGE_CENTRAL_PROVIDER = 'message_central'

const client = axios.create({
  baseURL: env.messageCentral.baseUrl,
  timeout: 10_000,
})

let tokenCache = {
  token: null,
  expiresAt: 0,
}

const isConfigured = () =>
  Boolean(
    env.messageCentral.customerId &&
      (env.messageCentral.authKey || env.messageCentral.staticToken)
  )

const getFallbackExpiry = () => Date.now() + 10 * 60 * 1000

const getAuthToken = async () => {
  if (env.messageCentral.staticToken) {
    return env.messageCentral.staticToken
  }

  if (!isConfigured()) {
    throw new AppError(500, 'MessageCentral credentials missing')
  }

  if (tokenCache.token && tokenCache.expiresAt > Date.now() + 5_000) {
    return tokenCache.token
  }

  try {
    const params = new URLSearchParams({
      customerId: env.messageCentral.customerId,
      key: env.messageCentral.authKey,
    })

    if (env.messageCentral.scope) {
      params.append('scope', env.messageCentral.scope)
    }
    if (env.messageCentral.countryCode) {
      params.append('country', env.messageCentral.countryCode)
    }
    if (env.messageCentral.email) {
      params.append('email', env.messageCentral.email)
    }

    const { data } = await client.get('/auth/v1/authentication/token', {
      params,
      headers: { accept: '*/*' },
    })

    const authToken = data?.data?.authToken
    if (!authToken) {
      throw new Error('Missing authToken in response')
    }

    const expiresIn = Number(data?.data?.expiresIn)
    tokenCache = {
      token: authToken,
      expiresAt: Number.isFinite(expiresIn)
        ? Date.now() + expiresIn * 1000 - 30 * 1000
        : getFallbackExpiry(),
    }

    return authToken
  } catch (error) {
    const responseData = error?.response?.data
    if (responseData) {
      logger.error('MessageCentral token fetch failed: %s | response: %j', error?.message, responseData)
    } else {
      logger.error('MessageCentral token fetch failed: %s', error?.message)
    }
    throw new AppError(502, 'Failed to authenticate with OTP provider')
  }
}

const sendOtp = async ({ phone, otpLength = 6 }) => {
  if (!isConfigured()) {
    throw new AppError(500, 'MessageCentral is not configured')
  }

  const authToken = await getAuthToken()

  try {
    const params = new URLSearchParams({
      customerId: env.messageCentral.customerId,
      flowType: 'SMS',
      mobileNumber: phone,
    })

    if (env.messageCentral.countryCode) {
      params.append('countryCode', env.messageCentral.countryCode)
    }
    if (otpLength) {
      params.append('otpLength', String(otpLength))
    }

    const { data } = await client.post('/verification/v3/send', null, {
      params,
      headers: {
        accept: 'application/json',
        authToken,
      },
    })

    const responseCode = data?.responseCode ?? data?.data?.responseCode
    if (`${responseCode}` !== '200') {
      throw new Error(
        `Unexpected response code ${responseCode} (${data?.message || 'UNKNOWN'})`
      )
    }

    const payload = data?.data || {}
    return {
      provider: MESSAGE_CENTRAL_PROVIDER,
      verificationId: payload.verificationId || payload.veriFicationId || null,
      timeoutSeconds: Number(payload.timeout) || null,
      raw: data,
    }
  } catch (error) {
    logger.error('MessageCentral send OTP failed for %s: %s', phone, error?.message)
    throw new AppError(502, 'Failed to send OTP via MessageCentral')
  }
}

const mapValidationFailure = (code) => {
  const normalized = `${code || ''}`
  switch (normalized) {
    case '702':
      return 'invalid'
    case '703':
      return 'already_used'
    case '705':
      return 'expired'
    case '800':
      return 'max_attempts'
    case '700':
    case '511':
    case '506':
      return 'failed'
    default:
      return 'failed'
  }
}

const validateOtp = async ({ phone, verificationId, code }) => {
  if (!isConfigured()) {
    throw new AppError(500, 'MessageCentral is not configured')
  }

  const authToken = await getAuthToken()

  try {
    const params = new URLSearchParams({
      customerId: env.messageCentral.customerId,
      verificationId,
      code,
    })

    if (env.messageCentral.countryCode) {
      params.append('countryCode', env.messageCentral.countryCode)
    }
    if (phone) {
      params.append('mobileNumber', phone)
    }

    const { data } = await client.get('/verification/v3/validateOtp', {
      params,
      headers: {
        accept: 'application/json',
        authToken,
      },
    })

    const globalCode = data?.responseCode
    const payload = data?.data || {}
    const payloadCode = payload.responseCode || globalCode
    const status = payload.verificationStatus

    if (`${globalCode}` === '200' && status === 'VERIFICATION_COMPLETED') {
      return { success: true, payload }
    }

    const reason = mapValidationFailure(payloadCode)
    return {
      success: false,
      reason,
      payload,
    }
  } catch (error) {
    logger.error('MessageCentral OTP validation failed for %s: %s', phone, error?.message)
    throw new AppError(502, 'Failed to validate OTP with MessageCentral')
  }
}

module.exports = {
  MESSAGE_CENTRAL_PROVIDER,
  isConfigured,
  sendOtp,
  validateOtp,
}
