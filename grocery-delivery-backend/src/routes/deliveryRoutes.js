const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { asyncHandler } = require('../utils/http')
const controller = require('../controllers/orderController')

const router = express.Router()
router.use(authMiddleware, roleMiddleware('DELIVERY'))
router.get('/dashboard', asyncHandler(controller.deliveryDashboard))
router.patch('/availability', asyncHandler(controller.updateAvailability))
router.patch('/orders/:id/advance', asyncHandler(controller.advanceDelivery))
router.patch('/orders/:id/decline', asyncHandler(controller.declineDelivery))
router.post('/orders/:id/complete', asyncHandler(controller.completeDelivery))
router.post('/orders/:id/issue', asyncHandler(controller.reportDeliveryIssue))

module.exports = router
