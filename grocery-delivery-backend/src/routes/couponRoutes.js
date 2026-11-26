const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const optionalAuth = require('../middleware/optionalAuthMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { asyncHandler } = require('../utils/http')
const controller = require('../controllers/commerceController')

const router = express.Router()
router.get('/', optionalAuth, asyncHandler(controller.listCoupons))
router.post('/validate', authMiddleware, roleMiddleware('CUSTOMER'), asyncHandler(controller.validateCoupon))
router.post('/', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.createCoupon))
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.updateCoupon))
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.deleteCoupon))

module.exports = router
