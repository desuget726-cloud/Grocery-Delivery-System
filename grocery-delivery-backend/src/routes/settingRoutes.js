const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { asyncHandler } = require('../utils/http')
const controller = require('../controllers/commerceController')

const router = express.Router()
router.get('/public', asyncHandler(controller.publicSettings))
router.put('/', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.updateSettings))

module.exports = router
