const cookie = require('cookie')
const { verifyToken } = require('../services/auth/jwt.service')
const { COOKIE_NAMES, USER_ROLES } = require('../constants')
const { AppError } = require('../utils/errors')

const getTokenFromRequest = (req) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.slice('Bearer '.length)
  }

  if (req.headers.cookie) {
    const parsed = cookie.parse(req.headers.cookie)
    if (parsed[COOKIE_NAMES.ADMIN_AUTH_TOKEN]) {
      return parsed[COOKIE_NAMES.ADMIN_AUTH_TOKEN]
    }
  }

  if (req.cookies && req.cookies[COOKIE_NAMES.ADMIN_AUTH_TOKEN]) {
    return req.cookies[COOKIE_NAMES.ADMIN_AUTH_TOKEN]
  }

  return null
}

const adminAuthMiddleware = (req, res, next) => {
  const token = getTokenFromRequest(req)
  if (!token) {
    return next(new AppError(401, 'Admin authentication required'))
  }

  try {
    const payload = verifyToken(token)
    if (payload.role !== USER_ROLES.ADMIN) {
      return next(new AppError(403, 'Admin privileges required'))
    }

    req.admin = {
      username: payload.username,
      role: payload.role,
    }
    next()
  } catch (error) {
    return next(new AppError(401, 'Invalid or expired admin token'))
  }
}

module.exports = adminAuthMiddleware
