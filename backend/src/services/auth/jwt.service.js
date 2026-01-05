const jwt = require('jsonwebtoken')
const env = require('../../config/env')

const TOKEN_DEFAULTS = {
  expiresIn: '365d',
}

const signToken = (payload, options = {}) => {
  return jwt.sign(payload, env.jwtSecret, { ...TOKEN_DEFAULTS, ...options })
}

const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret)
}

module.exports = {
  signToken,
  verifyToken,
}
