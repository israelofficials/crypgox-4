const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const env = require('./config/env')
const logger = require('./utils/logger')
const { AppError } = require('./utils/errors')
const errorHandler = require('./middlewares/error.middleware')

const authRoutes = require('./routes/auth.routes')
const adminRoutes = require('./routes/admin.routes')
const userRoutes = require('./routes/user.routes')
const publicRoutes = require('./routes/public.routes')

const app = express()

app.set('trust proxy', 1)

const allowedOrigins = env.frontendOrigins

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/public', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)

app.use((req, res, next) => {
  next(new AppError(404, 'Resource not found'))
})

app.use(errorHandler)

app.on('error', (error) => {
  logger.error('Express app error: %s', error.message)
})

module.exports = app
