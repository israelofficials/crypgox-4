const rateLimit = require('express-rate-limit')

const THREE_HOURS_MS = 3 * 60 * 60 * 1000

const otpLimiter = rateLimit({
  windowMs: THREE_HOURS_MS,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'OTP request limit reached. Please try again after 3 hours.',
    })
  },
})

module.exports = {
  otpLimiter,
}
