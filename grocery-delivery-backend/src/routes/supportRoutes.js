const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const optionalAuth = require('../middleware/optionalAuthMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { asyncHandler } = require('../utils/http')
const controller = require('../controllers/commerceController')

const router = express.Router()
router.post('/', optionalAuth, asyncHandler(controller.createSupportTicket))
router.get('/mine', authMiddleware, roleMiddleware('CUSTOMER'), asyncHandler(controller.listSupportTickets))
router.get('/', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.listSupportTickets))
router.patch('/:id', authMiddleware, roleMiddleware('CUSTOMER', 'ADMIN'), asyncHandler(controller.updateSupportTicket))
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.deleteSupportTicket))

module.exports = router
