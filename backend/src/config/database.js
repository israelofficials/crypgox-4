const { Pool } = require('pg')
const env = require('./env')
const logger = require('../utils/logger')

if (!env.database.url) {
  logger.error('DATABASE_URL is not defined in environment variables')
  throw new Error('DATABASE_URL is required')
}

const pool = new Pool({
  connectionString: env.database.url,
  ssl: env.database.ssl ? { rejectUnauthorized: false } : false,
})

pool.on('error', (error) => {
  logger.error('Unexpected database error: %s', error.message)
})

const query = (text, params) => pool.query(text, params)

const close = () => pool.end()

module.exports = {
  pool,
  query,
  close,
}
