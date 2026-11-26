const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { asyncHandler } = require('../utils/http')
const controller = require('../controllers/commerceController')

const router = express.Router()
router.use(authMiddleware, roleMiddleware('ADMIN'))
router.get('/', asyncHandler(controller.listNotifications))
router.post('/', asyncHandler(controller.createNotification))
router.patch('/read-all', asyncHandler(controller.markAllNotificationsRead))
router.patch('/:id/read', asyncHandler(controller.markNotificationRead))
router.delete('/:id', asyncHandler(controller.deleteNotification))

module.exports = router
