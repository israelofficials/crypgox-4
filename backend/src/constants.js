const env = require('./config/env')

const USER_ROLES = Object.freeze({
  USER: 'USER',
  ADMIN: 'ADMIN',
})

const COOKIE_NAMES = Object.freeze({
  AUTH_TOKEN: 'crypgo_token',
  ADMIN_AUTH_TOKEN: env.admin.cookieName,
})

const REFERRAL_PAYOUT_THRESHOLD_INR = 500

module.exports = {
  USER_ROLES,
  COOKIE_NAMES,
  REFERRAL_PAYOUT_THRESHOLD_INR,
}
