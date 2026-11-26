const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { asyncHandler } = require('../utils/http')
const controller = require('../controllers/catalogController')

const router = express.Router()
router.get('/', optionalAuthMiddleware, asyncHandler(controller.listProducts))
router.get('/:id', asyncHandler(controller.getProduct))
router.post('/', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.createProduct))
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.updateProduct))
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.deleteProduct))
router.patch('/:id/stock', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.updateStock))

module.exports = router
