const express = require('express')
const userAuthController = require('../controllers/auth/userAuth.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const platformSettingsMiddleware = require('../middlewares/platformSettings.middleware')
const { otpLimiter } = require('../middlewares/rateLimit.middleware')

const router = express.Router()

router.post('/otp/request', otpLimiter, userAuthController.requestOtp)
router.post('/otp/verify', otpLimiter, userAuthController.verifyOtp)

router.get('/me', authMiddleware, platformSettingsMiddleware, userAuthController.getProfile)
router.post('/logout', authMiddleware, userAuthController.logout)

module.exports = router
