require('dotenv').config()

const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const prisma = require('./src/config/prisma')

const routes = {
  auth: require('./src/routes/authRoutes'),
  products: require('./src/routes/productRoutes'),
  categories: require('./src/routes/categoryRoutes'),
  wishlist: require('./src/routes/wishlistRoutes'),
  orders: require('./src/routes/orderRoutes'),
  delivery: require('./src/routes/deliveryRoutes'),
  coupons: require('./src/routes/couponRoutes'),
  payments: require('./src/routes/paymentRoutes'),
  reviews: require('./src/routes/reviewRoutes'),
  support: require('./src/routes/supportRoutes'),
  notifications: require('./src/routes/notificationRoutes'),
  settings: require('./src/routes/settingRoutes'),
  admin: require('./src/routes/adminRoutes'),
}

const app = express()
const port = Number(process.env.PORT) || 5000

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '5mb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/', (req, res) => {
  res.json({
    message: 'Grocery Delivery API is running successfully',
    status: 'OK',
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/health', async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.status(200).json({ status: 'ok', database: 'connected' })
  } catch (error) {
    next(error)
  }
})

for (const [name, router] of Object.entries(routes)) {
  app.use(`/api/${name}`, router)
}

app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }

  const status = Number.isInteger(error.status) ? error.status : 500
  if (status >= 500) {
    console.error(error)
  }

  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : error.message,
  })
})

if (require.main === module) {
  const server = app.listen(port, () => {
    console.log(`Grocery Delivery API listening on port ${port}`)
  })

  const shutdown = (signal) => {
    console.log(`${signal} received; closing server`)
    server.close(async (error) => {
      if (error) {
        console.error('Error while closing HTTP server:', error)
        process.exitCode = 1
      }

      try {
        await prisma.$disconnect()
      } catch (disconnectError) {
        console.error('Error while disconnecting Prisma:', disconnectError)
        process.exitCode = 1
      }
    })
  }

  process.once('SIGINT', () => shutdown('SIGINT'))
  process.once('SIGTERM', () => shutdown('SIGTERM'))
}

module.exports = app
