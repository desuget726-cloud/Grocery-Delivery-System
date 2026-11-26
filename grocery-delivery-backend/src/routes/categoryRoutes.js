const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const optionalAuth = require('../middleware/optionalAuthMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { asyncHandler } = require('../utils/http')
const controller = require('../controllers/catalogController')

const router = express.Router()
router.get('/', optionalAuth, asyncHandler(controller.listCategories))
router.get('/:id', asyncHandler(controller.getCategory))
router.post('/', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.createCategory))
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.updateCategory))
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.deleteCategory))

module.exports = router
