const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { asyncHandler } = require('../utils/http')
const controller = require('../controllers/commerceController')

const router = express.Router()
router.use(authMiddleware)
router.post('/chapa/initialize', roleMiddleware('CUSTOMER'), asyncHandler(controller.initializeChapa))
router.post('/chapa/verify', roleMiddleware('CUSTOMER', 'ADMIN'), asyncHandler(controller.verifyChapa))
router.post('/cod/settle', roleMiddleware('ADMIN'), asyncHandler(controller.settleCod))

module.exports = router
