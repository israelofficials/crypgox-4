const express = require('express')

const authMiddleware = require('../middlewares/auth.middleware')
const depositController = require('../controllers/user/deposit.controller')
const walletController = require('../controllers/user/wallet.controller')
const withdrawController = require('../controllers/user/withdraw.controller')
const sellController = require('../controllers/user/sell.controller')
const payeeController = require('../controllers/user/payee.controller')
const referralController = require('../controllers/user/referral.controller')

const router = express.Router()

router.use(authMiddleware)

router.post('/deposits', depositController.createDepositOrder)
router.get('/deposits', depositController.listDeposits)
router.get('/deposits/:depositId', depositController.getDeposit)
router.post('/deposits/:depositId/verify', depositController.verifyDeposit)
router.post('/deposits/:depositId/cancel', depositController.cancelDeposit)

router.get('/wallets', walletController.listWallets)
router.post('/wallets', walletController.createWallet)
router.delete('/wallets/:walletId', walletController.deleteWallet)

router.get('/withdrawals', withdrawController.listWithdrawals)
router.post('/withdrawals', withdrawController.createWithdrawalOrder)
router.get('/withdrawals/:withdrawalId', withdrawController.getWithdrawal)

router.get('/sell-orders', sellController.listSellOrders)
router.post('/sell-orders', sellController.createSellOrder)
router.get('/sell-orders/:orderId', sellController.getSellOrder)

router.get('/payees', payeeController.listPayees)
router.post('/payees', payeeController.createPayee)
router.delete('/payees/:payeeId', payeeController.deletePayee)

router.post('/referrals/redeem', referralController.redeemRewards)

module.exports = router
