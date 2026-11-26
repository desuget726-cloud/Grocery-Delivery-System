const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { asyncHandler } = require('../utils/http')
const controller = require('../controllers/catalogController')

const router = express.Router()
router.use(authMiddleware, roleMiddleware('CUSTOMER'))
router.get('/', asyncHandler(controller.getWishlist))
router.post('/toggle/:productId', asyncHandler(controller.toggleWishlist))

module.exports = router
