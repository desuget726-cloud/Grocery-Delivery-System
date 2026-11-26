const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const { asyncHandler } = require('../utils/http')
const admin = require('../controllers/adminController')
const commerce = require('../controllers/commerceController')

const router = express.Router()
router.use(authMiddleware, roleMiddleware('ADMIN'))
router.get('/dashboard', asyncHandler(admin.dashboard))
router.get('/revenue/weekly', asyncHandler(admin.weeklyRevenue))
router.get('/inventory/low-stock', asyncHandler(admin.listProductsInventory))
router.get('/audit-logs', asyncHandler(admin.auditLogs))
router.get('/orders/:id', asyncHandler(admin.adminOrderDetail))

for (const group of ['customers', 'delivery-staff']) {
  router.get(`/${group}`, asyncHandler(commerce.listStaff))
  router.post(`/${group}`, asyncHandler(commerce.createStaff))
  router.put(`/${group}/:id`, asyncHandler(commerce.updateStaff))
  router.delete(`/${group}/:id`, asyncHandler(commerce.deleteStaff))
}

module.exports = router
