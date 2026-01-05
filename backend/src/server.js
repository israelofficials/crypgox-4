const http = require('http')
const app = require('./app')
const env = require('./config/env')
const logger = require('./utils/logger')

const server = http.createServer(app)

const start = () => {
  server.listen(env.port, () => {
    logger.info('Server listening on port %d', env.port)
  })

  server.on('error', (error) => {
    logger.error('Server error: %s', error.message)
    process.exit(1)
  })
}

if (require.main === module) {
  start()
}

module.exports = {
  app,
  start,
}
