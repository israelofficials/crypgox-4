const env = require('../../config/env')
const { signToken } = require('../../services/auth/jwt.service')
const { COOKIE_NAMES, USER_ROLES } = require('../../constants')
const { AppError } = require('../../utils/errors')
const asyncHandler = require('../../utils/asyncHandler')

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {}

  if (!username || !password) {
    throw new AppError(400, 'Username and password are required')
  }

  if (username !== env.admin.username || password !== env.admin.password) {
    throw new AppError(401, 'Invalid administrator credentials')
  }

  const token = signToken(
    {
      sub: `admin:${username}`,
      role: USER_ROLES.ADMIN,
      username,
    },
    { expiresIn: '12h' }
  )

  res.cookie(COOKIE_NAMES.ADMIN_AUTH_TOKEN, token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60 * 1000,
  })

  res.status(200).json({
    message: 'Admin login successful',
    admin: { username, role: USER_ROLES.ADMIN },
  })
})

const me = asyncHandler(async (req, res) => {
  const admin = req.admin
  if (!admin) {
    throw new AppError(401, 'Authentication required')
  }

  res.status(200).json({
    admin,
  })
})

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAMES.ADMIN_AUTH_TOKEN)
  res.status(200).json({ message: 'Admin logged out' })
})

const metrics = asyncHandler(async (req, res) => {
  res.status(200).json({
    metrics: {
      totalUsers: 32540,
      totalUsdt: 148200,
      totalInr: 6240000,
      pendingWithdrawals: 18,
      pendingDeposits: 11,
      walletBalances: {
        usdt: 86420,
        inr: 2870000,
      },
    },
  })
})

module.exports = {
  login,
  me,
  logout,
  metrics,
}
