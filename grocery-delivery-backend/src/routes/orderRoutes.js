const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { asyncHandler } = require('../utils/http')
const controller = require('../controllers/orderController')

const router = express.Router()
router.use(authMiddleware)
router.post('/', roleMiddleware('CUSTOMER'), asyncHandler(controller.createOrder))
router.get('/my-orders', roleMiddleware('CUSTOMER'), asyncHandler(controller.myOrders))
router.patch('/:id/cancel', roleMiddleware('CUSTOMER'), asyncHandler(controller.cancelOrder))
router.get('/', roleMiddleware('ADMIN'), asyncHandler(controller.listOrders))
router.patch('/:id/status', roleMiddleware('ADMIN'), asyncHandler(controller.updateOrderStatus))
router.patch('/:id/assign-rider', roleMiddleware('ADMIN'), asyncHandler(controller.assignRider))

module.exports = router
