const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const prisma = require('../config/prisma')
const { logAudit } = require('../utils/auditLogger')
const { httpError, requiredString } = require('../utils/http')

function couponData(body, partial) {
  const fields = ['code', 'description', 'discountType', 'value', 'minOrder', 'usageLimit', 'expiryDate', 'isActive']
  const data = {}
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) data[field] = body[field]
  }
  if (!partial && (!data.code || !data.discountType || data.value === undefined)) {
    throw httpError(400, 'code, discountType, and value are required')
  }
  if (data.code !== undefined) data.code = requiredString(data.code, 'code').toUpperCase()
  if (data.discountType !== undefined && !['PERCENTAGE', 'FIXED', 'FREE_DELIVERY'].includes(data.discountType)) {
    throw httpError(400, 'discountType must be PERCENTAGE, FIXED, or FREE_DELIVERY')
  }
  for (const field of ['value', 'minOrder']) {
    if (data[field] !== undefined && (!Number.isFinite(Number(data[field])) || Number(data[field]) < 0)) {
      throw httpError(400, `${field} must be a non-negative number`)
    }
  }
  if (data.usageLimit !== undefined && data.usageLimit !== null &&
      (!Number.isInteger(Number(data.usageLimit)) || Number(data.usageLimit) < 1)) {
    throw httpError(400, 'usageLimit must be a positive integer or null')
  }
  if (data.usageLimit !== undefined && data.usageLimit !== null) data.usageLimit = Number(data.usageLimit)
  if (data.expiryDate !== undefined && data.expiryDate !== null) {
    data.expiryDate = new Date(data.expiryDate)
    if (Number.isNaN(data.expiryDate.getTime())) throw httpError(400, 'expiryDate must be a valid date')
  }
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') throw httpError(400, 'isActive must be a boolean')
  return data
}

exports.listCoupons = async (req, res) => {
  const where = req.user && req.user.role === 'ADMIN'
    ? undefined
    : { isActive: true, OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }] }
  const coupons = await prisma.coupon.findMany({ where, orderBy: { code: 'asc' } })
  return res.json({ coupons })
}

exports.createCoupon = async (req, res) => {
  try {
    const coupon = await prisma.coupon.create({ data: couponData(req.body, false) })
    return res.status(201).json({ coupon })
  } catch (error) {
    if (error.code === 'P2002') throw httpError(409, 'A coupon with this code already exists')
    throw error
  }
}

exports.updateCoupon = async (req, res) => {
  const data = couponData(req.body, true)
  if (!Object.keys(data).length) throw httpError(400, 'Provide at least one coupon field to update')
  try {
    const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data })
    return res.json({ coupon })
  } catch (error) {
    if (error.code === 'P2025') throw httpError(404, 'Coupon not found')
    if (error.code === 'P2002') throw httpError(409, 'A coupon with this code already exists')
    throw error
  }
}

exports.deleteCoupon = async (req, res) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } })
    return res.json({ message: 'Coupon deleted' })
  } catch (error) {
    if (error.code === 'P2025') throw httpError(404, 'Coupon not found')
    throw error
  }
}

exports.validateCoupon = async (req, res) => {
  const code = requiredString(req.body.code, 'code').toUpperCase()
  const subtotal = Number(req.body.subtotal)
  if (!Number.isFinite(subtotal) || subtotal < 0) throw httpError(400, 'subtotal must be a non-negative number')
  const coupon = await prisma.coupon.findUnique({ where: { code } })
  if (!coupon || !coupon.isActive || (coupon.expiryDate && coupon.expiryDate <= new Date())) {
    throw httpError(400, 'Coupon is invalid or expired')
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) throw httpError(400, 'Coupon usage limit has been reached')
  if (subtotal < Number(coupon.minOrder)) throw httpError(400, 'Order does not meet the coupon minimum')
  const discount = coupon.discountType === 'PERCENTAGE'
    ? Math.min(subtotal, subtotal * Number(coupon.value) / 100)
    : coupon.discountType === 'FIXED'
      ? Math.min(subtotal, Number(coupon.value))
      : 0
  return res.json({ coupon, discount, freeDelivery: coupon.discountType === 'FREE_DELIVERY' })
}

async function chapaRequest(url, options) {
  let response
  try {
    response = await fetch(url, options)
  } catch (error) {
    throw httpError(502, 'Unable to reach the Chapa payment service')
  }
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload || payload.status === 'failed') {
    const error = httpError(502, 'Chapa payment request failed')
    error.details = payload && payload.message
    throw error
  }
  return payload
}

exports.initializeChapa = async (req, res) => {
  if (!process.env.CHAPA_SECRET_KEY) throw httpError(503, 'Chapa payments are not configured')
  const orderId = requiredString(req.body.orderId, 'orderId')
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: req.user.id, paymentMethod: 'CHAPA' },
    include: { customer: true, transactions: true },
  })
  if (!order) throw httpError(404, 'Chapa order not found')
  if (order.paymentStatus !== 'PENDING') throw httpError(409, 'This order is not awaiting payment')
  const transaction = order.transactions.find((item) => item.status === 'PENDING')
  if (!transaction) throw httpError(409, 'Pending payment transaction not found')
  const txRef = transaction.txRef || `gds-${crypto.randomUUID()}`
  await prisma.transaction.update({ where: { id: transaction.id }, data: { txRef } })
  const paymentState = await prisma.transaction.findUnique({
    where: { id: transaction.id },
    include: { order: { select: { orderStatus: true, paymentStatus: true } } },
  })
  if (!paymentState || paymentState.status !== 'PENDING' || paymentState.order.orderStatus === 'CANCELED' ||
      paymentState.order.paymentStatus !== 'PENDING') {
    throw httpError(409, 'This order is no longer awaiting payment')
  }

  const [firstName, ...lastParts] = order.customer.fullName.trim().split(/\s+/)
  const initialized = await chapaRequest('https://api.chapa.co/v1/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Number(order.total).toFixed(2),
      currency: 'ETB',
      email: order.customer.email,
      first_name: firstName,
      last_name: lastParts.join(' ') || firstName,
      tx_ref: txRef,
      callback_url: process.env.CHAPA_CALLBACK_URL,
      return_url: process.env.CHAPA_RETURN_URL,
      customization: { title: 'Grocery order', description: order.orderCode },
    }),
  })
  await logAudit({
    req,
    user: req.user,
    action: 'INITIALIZE_PAYMENT',
    entity: 'Transaction',
    entityId: transaction.id,
    details: `Initialized Chapa payment for order ${order.orderCode}.`,
  })
  return res.json({ txRef, checkoutUrl: initialized.data && initialized.data.checkout_url, chapa: initialized })
}

exports.verifyChapa = async (req, res) => {
  if (!process.env.CHAPA_SECRET_KEY) throw httpError(503, 'Chapa payments are not configured')
  const txRef = requiredString(req.body.txRef || req.params.txRef, 'txRef')
  const transaction = await prisma.transaction.findFirst({
    where: { txRef, method: 'CHAPA' },
    include: { order: true },
  })
  if (!transaction || (req.user.role !== 'ADMIN' && transaction.userId !== req.user.id)) {
    throw httpError(404, 'Payment transaction not found')
  }
  if (transaction.status !== 'PENDING' || transaction.order.orderStatus === 'CANCELED') {
    throw httpError(409, 'This payment is no longer pending')
  }
  const verified = await chapaRequest(
    `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`,
    { headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` } },
  )
  const result = verified.data || {}
  if (String(result.status).toLowerCase() !== 'success') throw httpError(400, 'Chapa has not confirmed this payment')
  if (result.amount !== undefined &&
      Math.round(Number(result.amount) * 100) !== Math.round(Number(transaction.amount) * 100)) {
    throw httpError(409, 'Verified payment amount does not match the order')
  }
  const updated = await prisma.$transaction(async (tx) => {
    await tx.transaction.updateMany({
      where: { id: transaction.id, status: 'PENDING' },
      data: { status: 'PAID' },
    })
    await tx.order.updateMany({
      where: { id: transaction.orderId, paymentStatus: 'PENDING' },
      data: { paymentStatus: 'PAID' },
    })
    return tx.order.findUnique({ where: { id: transaction.orderId }, include: { items: true } })
  })
  await logAudit({
    req,
    user: req.user,
    action: 'VERIFY_PAYMENT',
    entity: 'Transaction',
    entityId: transaction.id,
    details: `Verified Chapa payment for order ${transaction.order.orderCode}.`,
  })
  return res.json({ verified: true, order: updated, transaction: await prisma.transaction.findUnique({ where: { id: transaction.id } }) })
}

exports.settleCod = async (req, res) => {
  const riderId = requiredString(req.body.riderId, 'riderId')
  const amount = Number(req.body.amount)
  if (!Number.isFinite(amount) || amount <= 0) throw httpError(400, 'amount must be greater than zero')
  const settlement = await prisma.$transaction(async (tx) => {
    const result = await tx.user.updateMany({
      where: { id: riderId, role: 'DELIVERY', codCashHeld: { gte: amount } },
      data: { codCashHeld: { decrement: amount } },
    })
    if (result.count !== 1) throw httpError(409, 'Rider not found or settlement exceeds held COD cash')
    const rider = await tx.user.findUnique({
      where: { id: riderId },
      select: { id: true, fullName: true, codCashHeld: true },
    })
    await tx.notification.create({
      data: {
        title: 'COD cash settled',
        message: `${amount.toFixed(2)} ETB cash was reconciled for ${rider.fullName}.`,
        category: 'PAYMENT',
        actionPath: '/admin/payments',
      },
    })
    return rider
  })
  await logAudit({
    req,
    user: req.user,
    action: 'SETTLE_COD',
    entity: 'User',
    entityId: settlement.id,
    details: `Settled ${amount.toFixed(2)} ETB COD cash for ${settlement.fullName}.`,
  })
  return res.json({ rider: settlement, settledAmount: amount })
}

exports.listReviews = async (req, res) => {
  const where = req.user && req.user.role === 'ADMIN'
    ? {}
    : { status: 'PUBLISHED' }
  if (req.user && req.user.role === 'ADMIN' && req.query.status) {
    where.status = String(req.query.status).toUpperCase()
    if (!['PENDING', 'PUBLISHED', 'HIDDEN'].includes(where.status)) throw httpError(400, 'Invalid review status')
  }
  if (req.query.productId) where.productId = String(req.query.productId)
  const reviews = await prisma.review.findMany({
    where,
    include: {
      user: { select: { id: true, fullName: true, avatar: true } },
      product: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return res.json({ reviews })
}

exports.createReview = async (req, res) => {
  const productId = requiredString(req.body.productId, 'productId')
  const orderCode = requiredString(req.body.orderCode, 'orderCode')
  const rating = Number(req.body.rating)
  const comment = requiredString(req.body.comment, 'comment')
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw httpError(400, 'rating must be an integer from 1 to 5')
  const order = await prisma.order.findFirst({
    where: {
      orderCode,
      customerId: req.user.id,
      orderStatus: 'DELIVERED',
      items: { some: { productId } },
    },
  })
  if (!order) throw httpError(403, 'Reviews can only be submitted for products in your delivered orders')
  try {
    const review = await prisma.review.create({
      data: { productId, userId: req.user.id, orderCode, rating, comment, status: 'PENDING' },
    })
    return res.status(201).json({ review })
  } catch (error) {
    if (error.code === 'P2002') throw httpError(409, 'You have already reviewed this product for that order')
    if (error.code === 'P2003') throw httpError(404, 'Product not found')
    throw error
  }
}

exports.moderateReview = async (req, res) => {
  const data = {}
  if (req.body.status !== undefined) {
    const status = String(req.body.status).toUpperCase()
    if (!['PENDING', 'PUBLISHED', 'HIDDEN'].includes(status)) throw httpError(400, 'Invalid review status')
    data.status = status
  }
  if (req.body.adminReply !== undefined) {
    if (req.body.adminReply !== null && typeof req.body.adminReply !== 'string') throw httpError(400, 'adminReply must be a string or null')
    data.adminReply = req.body.adminReply
  }
  if (!Object.keys(data).length) throw httpError(400, 'Provide status or adminReply')
  try {
    return res.json({ review: await prisma.review.update({ where: { id: req.params.id }, data }) })
  } catch (error) {
    if (error.code === 'P2025') throw httpError(404, 'Review not found')
    throw error
  }
}

exports.deleteReview = async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } })
    return res.json({ message: 'Review deleted' })
  } catch (error) {
    if (error.code === 'P2025') throw httpError(404, 'Review not found')
    throw error
  }
}

exports.createSupportTicket = async (req, res) => {
  const name = requiredString(req.body.name || (req.user && req.user.fullName), 'name')
  const email = requiredString(req.body.email || (req.user && req.user.email), 'email').toLowerCase()
  const phone = requiredString(req.body.phone || (req.user && req.user.phone), 'phone')
  const topic = requiredString(req.body.topic, 'topic')
  const initialMessage = requiredString(req.body.message, 'message')
  const ticketCode = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
  const ticket = await prisma.supportTicket.create({
    data: {
      ticketCode,
      userId: req.user ? req.user.id : null,
      name,
      email,
      phone,
      orderCode: typeof req.body.orderCode === 'string' ? req.body.orderCode.trim() : null,
      topic,
      messages: [{ sender: 'customer', message: initialMessage, createdAt: new Date().toISOString() }],
    },
  })
  return res.status(201).json({ ticket })
}

exports.listSupportTickets = async (req, res) => {
  const where = req.user.role === 'ADMIN' ? undefined : { userId: req.user.id }
  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return res.json({ tickets })
}

exports.updateSupportTicket = async (req, res) => {
  const existing = await prisma.supportTicket.findUnique({ where: { id: req.params.id } })
  if (!existing) throw httpError(404, 'Support ticket not found')
  if (req.user.role !== 'ADMIN' && existing.userId !== req.user.id) {
    throw httpError(404, 'Support ticket not found')
  }
  if (req.user.role !== 'ADMIN' && req.body.status !== undefined) {
    throw httpError(403, 'Only administrators can change ticket status')
  }
  const data = {}
  if (req.body.status !== undefined) {
    const status = String(req.body.status).toUpperCase()
    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) throw httpError(400, 'Invalid support ticket status')
    data.status = status
  }
  if (req.body.message !== undefined) {
    const message = requiredString(req.body.message, 'message')
    const messages = Array.isArray(existing.messages) ? existing.messages : []
    data.messages = [...messages, {
      sender: req.user.role === 'ADMIN' ? 'support' : 'customer',
      message,
      createdAt: new Date().toISOString(),
    }]
  }
  if (!Object.keys(data).length) throw httpError(400, 'Provide a status or message')
  const result = await prisma.supportTicket.update({ where: { id: existing.id }, data })
  return res.json({ ticket: result })
}

exports.deleteSupportTicket = async (req, res) => {
  try {
    await prisma.supportTicket.delete({ where: { id: req.params.id } })
    return res.json({ message: 'Support ticket deleted' })
  } catch (error) {
    if (error.code === 'P2025') throw httpError(404, 'Support ticket not found')
    throw error
  }
}

exports.listNotifications = async (req, res) => {
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' } })
  return res.json({ notifications })
}

exports.createNotification = async (req, res) => {
  const title = requiredString(req.body.title, 'title')
  const message = requiredString(req.body.message, 'message')
  const category = requiredString(req.body.category, 'category')
  const notification = await prisma.notification.create({
    data: {
      title,
      message,
      category,
      priority: typeof req.body.priority === 'string' ? req.body.priority : 'NORMAL',
      actionPath: typeof req.body.actionPath === 'string' ? req.body.actionPath : null,
    },
  })
  return res.status(201).json({ notification })
}

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } })
    return res.json({ notification })
  } catch (error) {
    if (error.code === 'P2025') throw httpError(404, 'Notification not found')
    throw error
  }
}

exports.markAllNotificationsRead = async (req, res) => {
  const result = await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } })
  return res.json({ updated: result.count })
}

exports.deleteNotification = async (req, res) => {
  try {
    await prisma.notification.delete({ where: { id: req.params.id } })
    return res.json({ message: 'Notification deleted' })
  } catch (error) {
    if (error.code === 'P2025') throw httpError(404, 'Notification not found')
    throw error
  }
}

exports.publicSettings = async (req, res) => {
  const settings = await prisma.storeSetting.findFirst()
  if (!settings) throw httpError(404, 'Store settings have not been initialized')
  const paymentGateways = settings.paymentGateways && typeof settings.paymentGateways === 'object'
    ? Object.fromEntries(Object.entries(settings.paymentGateways).filter(([, value]) => typeof value === 'boolean'))
    : {}
  return res.json({
    settings: {
      id: settings.id,
      storeName: settings.storeName,
      tagline: settings.tagline,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      warehouseAddress: settings.warehouseAddress,
      logoUrl: settings.logoUrl,
      isStoreOpen: settings.isStoreOpen,
      maintenanceMessage: settings.maintenanceMessage,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      standardFee: settings.standardFee,
      expressFee: settings.expressFee,
      minOrderAmount: settings.minOrderAmount,
      vatRate: settings.vatRate,
      requireDeliveryOtp: settings.requireDeliveryOtp,
      zones: settings.zones,
      paymentGateways,
      timeSlots: settings.timeSlots,
    },
  })
}

exports.updateSettings = async (req, res) => {
  const fields = [
    'storeName', 'tagline', 'supportEmail', 'supportPhone', 'warehouseAddress', 'logoUrl',
    'isStoreOpen', 'maintenanceMessage', 'freeDeliveryThreshold', 'standardFee', 'expressFee',
    'minOrderAmount', 'vatRate', 'requireDeliveryOtp', 'zones', 'paymentGateways', 'timeSlots',
  ]
  const data = {}
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) data[field] = req.body[field]
  }
  if (!Object.keys(data).length) throw httpError(400, 'Provide at least one setting to update')
  for (const field of ['freeDeliveryThreshold', 'standardFee', 'expressFee', 'minOrderAmount', 'vatRate']) {
    if (data[field] !== undefined && (!Number.isFinite(Number(data[field])) || Number(data[field]) < 0)) {
      throw httpError(400, `${field} must be a non-negative number`)
    }
  }
  for (const field of ['isStoreOpen', 'requireDeliveryOtp']) {
    if (data[field] !== undefined && typeof data[field] !== 'boolean') throw httpError(400, `${field} must be a boolean`)
  }
  for (const field of ['zones', 'timeSlots']) {
    if (data[field] !== undefined && !Array.isArray(data[field])) throw httpError(400, `${field} must be an array`)
  }
  if (data.paymentGateways !== undefined &&
      (!data.paymentGateways || typeof data.paymentGateways !== 'object' || Array.isArray(data.paymentGateways))) {
    throw httpError(400, 'paymentGateways must be an object')
  }
  const current = await prisma.storeSetting.findFirst()
  if (!current) throw httpError(404, 'Store settings have not been initialized')
  const settings = await prisma.storeSetting.update({ where: { id: current.id }, data })
  await logAudit({
    req,
    user: req.user,
    action: 'UPDATE_SETTINGS',
    entity: 'StoreSetting',
    entityId: settings.id,
    details: `Updated store settings fields: ${Object.keys(data).join(', ')}.`,
  })
  return res.json({ settings })
}

function staffData(body, isNew, role) {
  const data = {}
  for (const field of ['fullName', 'email', 'phone', 'status', 'isOnline', 'vehicleType', 'plateNumber', 'assignedZone']) {
    if (Object.prototype.hasOwnProperty.call(body, field)) data[field] = body[field]
  }
  if (isNew) {
    data.fullName = requiredString(data.fullName, 'fullName')
    data.email = requiredString(data.email, 'email').toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw httpError(400, 'A valid email is required')
    const password = requiredString(body.password, 'password')
    if (password.length < 8) throw httpError(400, 'Password must be at least 8 characters')
    data.passwordHash = bcrypt.hashSync(password, 12)
    data.role = role
    delete data.status
  }
  if (data.status !== undefined && !['ACTIVE', 'SUSPENDED'].includes(String(data.status).toUpperCase())) {
    throw httpError(400, 'status must be ACTIVE or SUSPENDED')
  }
  if (data.status !== undefined) data.status = String(data.status).toUpperCase()
  if (data.isOnline !== undefined && typeof data.isOnline !== 'boolean') {
    throw httpError(400, 'isOnline must be a boolean')
  }
  if (!isNew && !Object.keys(data).length) throw httpError(400, 'Provide at least one user field to update')
  if (role === 'CUSTOMER') {
    delete data.isOnline
    delete data.vehicleType
    delete data.plateNumber
    delete data.assignedZone
  }
  return data
}

exports.listStaff = async (req, res) => {
  const role = req.params.group === 'customers' ? 'CUSTOMER' : 'DELIVERY'
  if (req.query.status && !['ACTIVE', 'SUSPENDED'].includes(String(req.query.status).toUpperCase())) {
    throw httpError(400, 'status must be ACTIVE or SUSPENDED')
  }
  const users = await prisma.user.findMany({
    where: { role, ...(req.query.status ? { status: String(req.query.status).toUpperCase() } : {}) },
    select: {
      id: true, fullName: true, email: true, phone: true, role: true, status: true,
      isOnline: true, vehicleType: true, plateNumber: true, assignedZone: true,
      rating: true, codCashHeld: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return res.json({ users })
}

exports.createStaff = async (req, res) => {
  const role = req.params.group === 'customers' ? 'CUSTOMER' : 'DELIVERY'
  try {
    const user = await prisma.user.create({
      data: staffData(req.body, true, role),
      select: { id: true, fullName: true, email: true, phone: true, role: true, status: true },
    })
    await logAudit({
      req,
      user: req.user,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: user.id,
      details: `Created ${role.toLowerCase()} account for ${user.fullName}.`,
    })
    return res.status(201).json({ user })
  } catch (error) {
    if (error.code === 'P2002') throw httpError(409, 'An account with this email already exists')
    throw error
  }
}

exports.updateStaff = async (req, res) => {
  const role = req.params.group === 'customers' ? 'CUSTOMER' : 'DELIVERY'
  const data = staffData(req.body, false, role)
  const existing = await prisma.user.findFirst({
    where: { id: req.params.id, role },
    select: { id: true, fullName: true, status: true },
  })
  if (!existing) throw httpError(404, 'User not found')
  if (data.email !== undefined) {
    data.email = requiredString(data.email, 'email').toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw httpError(400, 'A valid email is required')
  }
  if (data.fullName !== undefined) data.fullName = requiredString(data.fullName, 'fullName')
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, fullName: true, email: true, phone: true, role: true, status: true, isOnline: true, vehicleType: true, plateNumber: true, assignedZone: true },
    })
    const action = existing.status !== 'SUSPENDED' && user.status === 'SUSPENDED'
      ? 'SUSPEND_USER'
      : existing.status === 'SUSPENDED' && user.status === 'ACTIVE'
        ? 'RESTORE_USER'
        : 'UPDATE_USER'
    await logAudit({
      req,
      user: req.user,
      action,
      entity: 'User',
      entityId: user.id,
      details: `Updated ${role.toLowerCase()} account fields: ${Object.keys(data).join(', ')}.`,
    })
    return res.json({ user })
  } catch (error) {
    if (error.code === 'P2025') throw httpError(404, 'User not found')
    if (error.code === 'P2002') throw httpError(409, 'An account with this email already exists')
    throw error
  }
}

exports.deleteStaff = async (req, res) => {
  const role = req.params.group === 'customers' ? 'CUSTOMER' : 'DELIVERY'
  const user = await prisma.user.findFirst({ where: { id: req.params.id, role }, select: { id: true, fullName: true } })
  if (!user) throw httpError(404, 'User not found')
  try {
    await prisma.user.delete({ where: { id: user.id } })
    await logAudit({
      req,
      user: req.user,
      action: 'DELETE_USER',
      entity: 'User',
      entityId: user.id,
      details: `Deleted ${role.toLowerCase()} account for ${user.fullName}.`,
    })
    return res.json({ message: 'User deleted' })
  } catch (error) {
    if (error.code === 'P2003') throw httpError(409, 'This user has related records and cannot be deleted')
    throw error
  }
}
