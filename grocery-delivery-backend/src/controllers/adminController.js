const prisma = require('../config/prisma')
const { httpError } = require('../utils/http')

exports.dashboard = async (req, res) => {
  const [customers, deliveryStaff, orders, pendingOrders, stockCandidates, paidRevenue, recentOrders] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER', status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'DELIVERY', status: 'ACTIVE' } }),
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: { in: ['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY'] } } }),
    prisma.product.findMany({ where: { isActive: true }, select: { stock: true, lowStockThreshold: true } }),
    prisma.transaction.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { id: true, fullName: true } }, items: true },
    }),
  ])
  return res.json({
    kpis: {
      customers,
      deliveryStaff,
      orders,
      pendingOrders,
      lowStockProducts: stockCandidates.filter((product) => product.stock <= product.lowStockThreshold).length,
      revenue: paidRevenue._sum.amount || 0,
    },
    recentOrders: recentOrders.map(({ deliveryOtp, ...order }) => order),
  })
}

exports.weeklyRevenue = async (req, res) => {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setUTCDate(start.getUTCDate() - 6)
  const transactions = await prisma.transaction.findMany({
    where: { status: 'PAID', createdAt: { gte: start } },
    select: { amount: true, createdAt: true },
  })
  const values = new Map()
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + offset)
    values.set(date.toISOString().slice(0, 10), 0)
  }
  for (const transaction of transactions) {
    const key = transaction.createdAt.toISOString().slice(0, 10)
    values.set(key, (values.get(key) || 0) + Number(transaction.amount))
  }
  return res.json({
    stats: [...values.entries()].map(([date, revenue]) => ({ date, revenue: Number(revenue.toFixed(2)) })),
  })
}

exports.listProductsInventory = async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { stock: 'asc' },
  })
  return res.json({ products: products.filter((product) => product.stock <= product.lowStockThreshold) })
}

exports.adminOrderDetail = async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true, customer: { select: { id: true, fullName: true, email: true, phone: true } }, rider: { select: { id: true, fullName: true } }, transactions: true },
  })
  if (!order) throw httpError(404, 'Order not found')
  const { deliveryOtp, ...safeOrder } = order
  return res.json({ order: safeOrder })
}

exports.auditLogs = async (req, res) => {
  const page = Number(req.query.page || 1)
  const requestedLimit = Number(req.query.limit || 20)
  if (!Number.isInteger(page) || page < 1) throw httpError(400, 'page must be a positive integer')
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    throw httpError(400, 'limit must be a positive integer')
  }
  const limit = Math.min(requestedLimit, 100)
  const [total, logs] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])
  return res.json({
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
