const env = require('../config/env')
const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const response = {
    message: err.message || 'Something went wrong',
  }

  if (err.details) {
    response.details = err.details
  }

  if (statusCode >= 500 || !err.isOperational) {
    logger.error('Unhandled error: %s', err.stack || err.message)
  } else if (env.nodeEnv !== 'production') {
    logger.warn('Operational error: %s', err.message)
  }

  if (env.nodeEnv !== 'production' && statusCode >= 500) {
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}

module.exports = errorHandler
