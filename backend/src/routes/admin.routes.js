const express = require('express')
const adminAuthController = require('../controllers/auth/adminAuth.controller')
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware')
const adminDashboardController = require('../controllers/admin/adminDashboard.controller')

const router = express.Router()

router.post('/login', adminAuthController.login)
router.get('/me', adminAuthMiddleware, adminAuthController.me)
router.post('/logout', adminAuthMiddleware, adminAuthController.logout)
router.get('/metrics', adminAuthMiddleware, adminAuthController.metrics)
router.get('/dashboard/metrics', adminAuthMiddleware, adminDashboardController.getMetrics)
router.get('/dashboard/settings', adminAuthMiddleware, adminDashboardController.getSettings)
router.put('/dashboard/settings', adminAuthMiddleware, adminDashboardController.updateSettings)
router.get('/dashboard/users', adminAuthMiddleware, adminDashboardController.listUsers)
router.get('/dashboard/users/:userId', adminAuthMiddleware, adminDashboardController.getUserDetail)
router.put('/dashboard/users/:userId/status', adminAuthMiddleware, adminDashboardController.updateUserStatus)
router.get('/dashboard/users/:userId/transactions', adminAuthMiddleware, adminDashboardController.getUserTransactions)
router.get('/dashboard/transactions', adminAuthMiddleware, adminDashboardController.getTransactions)
router.post(
  '/dashboard/withdrawals/:withdrawalId/approve',
  adminAuthMiddleware,
  adminDashboardController.approveWithdrawal
)
router.post(
  '/dashboard/withdrawals/:withdrawalId/reject',
  adminAuthMiddleware,
  adminDashboardController.rejectWithdrawal
)

router.post(
  '/dashboard/sell-orders/:orderId/complete',
  adminAuthMiddleware,
  adminDashboardController.completeSellOrder
)
router.post(
  '/dashboard/sell-orders/:orderId/reject',
  adminAuthMiddleware,
  adminDashboardController.rejectSellOrder
)

module.exports = router
