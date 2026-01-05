const cookie = require('cookie')
const { verifyToken } = require('../services/auth/jwt.service')
const { findById } = require('../models/user.model')
const { COOKIE_NAMES } = require('../constants')
const { AppError } = require('../utils/errors')

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '').trim()
  }

  if (req.headers.cookie) {
    const parsed = cookie.parse(req.headers.cookie)
    if (parsed[COOKIE_NAMES.AUTH_TOKEN]) {
      return parsed[COOKIE_NAMES.AUTH_TOKEN]
    }
  }

  if (req.cookies && req.cookies[COOKIE_NAMES.AUTH_TOKEN]) {
    return req.cookies[COOKIE_NAMES.AUTH_TOKEN]
  }

  return null
}

const authMiddleware = async (req, res, next) => {
  const token = getTokenFromRequest(req)
  if (!token) {
    return next(new AppError(401, 'Authentication required'))
  }

  try {
    const payload = verifyToken(token)
    const user = await findById(payload.sub)
    if (!user) {
      return next(new AppError(401, 'User not found'))
    }

    req.user = user
    next()
  } catch (error) {
    return next(new AppError(401, 'Invalid or expired token'))
  }
}

module.exports = authMiddleware
