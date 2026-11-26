const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const { asyncHandler } = require('../utils/http')
const controller = require('../controllers/authController')

const router = express.Router()

router.post('/register', asyncHandler(controller.register))
router.post('/login', asyncHandler(controller.login))
router.get('/me', authMiddleware, asyncHandler(controller.me))
router.put('/profile', authMiddleware, asyncHandler(controller.updateProfile))
router.put('/change-password', authMiddleware, asyncHandler(controller.changePassword))
router.post('/addresses', authMiddleware, asyncHandler(controller.createAddress))
router.patch('/addresses/:id/default', authMiddleware, asyncHandler(controller.setDefaultAddress))
router.delete('/addresses/:id', authMiddleware, asyncHandler(controller.deleteAddress))
router.post('/forgot-password', asyncHandler(controller.forgotPassword))
router.post('/verify-otp', asyncHandler(controller.verifyOtp))
router.post('/reset-password', asyncHandler(controller.resetPassword))

module.exports = router
