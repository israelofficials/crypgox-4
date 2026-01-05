const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const defaultFrontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000'

const frontendOrigins = process.env.FRONTEND_ORIGINS
  ? process.env.FRONTEND_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : []

if (frontendOrigins.length === 0) {
  frontendOrigins.push(defaultFrontendOrigin)
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  frontendOrigin: defaultFrontendOrigin,
  frontendOrigins,
  database: {
    url: process.env.DATABASE_URL || '',
    ssl: process.env.DATABASE_SSL ? process.env.DATABASE_SSL !== 'false' : true,
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin',
    cookieName: process.env.ADMIN_COOKIE_NAME || 'crypgo_admin_token',
  },
  otp: {
    expirySeconds: Number(process.env.OTP_EXPIRY_SECONDS || 300),
    resendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 40),
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5),
    whitelist: {
      phone: process.env.OTP_DEV_PHONE || '1234567890',
      code: process.env.OTP_DEV_CODE || '1234',
    },
  },
  sms: {
    provider: process.env.SMS_PROVIDER || 'fast2sms',
    apiKey: process.env.SMS_API_KEY || '',
    senderId: process.env.SMS_SENDER_ID || 'CRYPGO',
  },
  messageCentral: {
    baseUrl: process.env.MESSAGE_CENTRAL_BASE_URL || 'https://cpaas.messagecentral.com',
    customerId: process.env.CENTRAL_CUSTOMER_ID || '',
    authKey: process.env.CENTRAL_AUTH_TOKEN || '',
    staticToken: process.env.CENTRAL_STATIC_TOKEN || '',
    countryCode: process.env.CENTRAL_COUNTRY_CODE || '91',
    scope: process.env.CENTRAL_SCOPE || 'NEW',
    email: process.env.CENTRAL_EMAIL || '',
  },
  tron: {
    apiKey: process.env['TRON-PRO-API-KEY'] || process.env.TRON_PRO_API_KEY || '',
  },
}

module.exports = env
