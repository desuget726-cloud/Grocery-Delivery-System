const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const optionalAuth = require('../middleware/optionalAuthMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { asyncHandler } = require('../utils/http')
const controller = require('../controllers/commerceController')

const router = express.Router()
router.get('/', optionalAuth, asyncHandler(controller.listReviews))
router.post('/', authMiddleware, roleMiddleware('CUSTOMER'), asyncHandler(controller.createReview))
router.get('/manage', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.listReviews))
router.patch('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.moderateReview))
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.deleteReview))

module.exports = router
