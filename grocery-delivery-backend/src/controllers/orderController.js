const crypto = require('crypto')
const prisma = require('../config/prisma')
const { logAudit } = require('../utils/auditLogger')
const { httpError, positiveInteger, requiredString } = require('../utils/http')

function paymentMethod(value) {
  const methods = {
    TELEBIRR: 'TELEBIRR',
    'CBE BIRR': 'CBE_BIRR',
    CBE_BIRR: 'CBE_BIRR',
    CHAPA: 'CHAPA',
    'CHAPA CARD': 'CHAPA',
    COD: 'COD',
    'CASH ON DELIVERY': 'COD',
  }
  const method = methods[String(value || '').trim().toUpperCase()]
  if (!method) throw httpError(400, 'paymentMethod must be Telebirr, CBE Birr, Chapa, or COD')
  return method
}

function normalizedItems(bodyItems) {
  if (!Array.isArray(bodyItems) || bodyItems.length === 0) throw httpError(400, 'At least one order item is required')
  const quantities = new Map()
  for (const item of bodyItems) {
    const productId = item && (item.productId || item.id)
    if (typeof productId !== 'string' || !productId.trim()) throw httpError(400, 'Each item must include a productId')
    const qty = positiveInteger(item.qty ?? item.quantity, 'item quantity')
    quantities.set(productId, (quantities.get(productId) || 0) + qty)
  }
  return [...quantities.entries()].map(([productId, qty]) => ({ productId, qty }))
}

function orderCode() {
  return `GDS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

function deliveryOtp() {
  return crypto.randomInt(1000, 10000).toString()
}

async function applyCoupon(tx, code, subtotal) {
  if (!code) return { coupon: null, discount: 0, freeDelivery: false }
  const coupon = await tx.coupon.findUnique({ where: { code: String(code).trim().toUpperCase() } })
  const now = new Date()
  if (!coupon || !coupon.isActive || (coupon.expiryDate && coupon.expiryDate <= now)) {
    throw httpError(400, 'Coupon is invalid or expired')
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw httpError(400, 'Coupon usage limit has been reached')
  }
  if (subtotal < Number(coupon.minOrder)) throw httpError(400, 'Order does not meet the coupon minimum')

  if (coupon.usageLimit !== null) {
    const reserved = await tx.coupon.updateMany({
      where: { id: coupon.id, usedCount: { lt: coupon.usageLimit }, isActive: true },
      data: { usedCount: { increment: 1 } },
    })
    if (reserved.count !== 1) throw httpError(409, 'Coupon usage limit has been reached')
  } else {
    await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })
  }

  if (coupon.discountType === 'PERCENTAGE') {
    return { coupon, discount: Math.min(subtotal, subtotal * Number(coupon.value) / 100), freeDelivery: false }
  }
  if (coupon.discountType === 'FIXED') {
    return { coupon, discount: Math.min(subtotal, Number(coupon.value)), freeDelivery: false }
  }
  return { coupon, discount: 0, freeDelivery: true }
}

exports.createOrder = async (req, res) => {
  const items = normalizedItems(req.body.items)
  const address = req.body.address && typeof req.body.address === 'object' ? req.body.address : {}
  const deliveryZone = requiredString(req.body.deliveryZone || address.zone, 'deliveryZone')
  const deliveryStreet = requiredString(req.body.deliveryStreet || address.street, 'deliveryStreet')
  const customerPhone = requiredString(req.body.customerPhone || address.phone || req.user.phone, 'customerPhone')
  const timeSlot = requiredString(req.body.timeSlot || req.body.deliverySlot, 'timeSlot')
  const method = paymentMethod(req.body.paymentMethod)

  const order = await prisma.$transaction(async (tx) => {
    const settings = await tx.storeSetting.findFirst()
    if (settings && !settings.isStoreOpen) throw httpError(409, 'The store is currently closed')

    const itemRecords = []
    let subtotal = 0
    for (const item of items) {
      const changed = await tx.product.updateMany({
        where: { id: item.productId, isActive: true, stock: { gte: item.qty } },
        data: { stock: { decrement: item.qty } },
      })
      if (changed.count !== 1) {
        const product = await tx.product.findUnique({ where: { id: item.productId }, select: { name: true, stock: true } })
        if (!product) throw httpError(404, 'One or more products are unavailable')
        throw httpError(409, `Insufficient stock for ${product.name}`)
      }
      const product = await tx.product.findUnique({ where: { id: item.productId } })
      if (!product || !product.isActive) throw httpError(404, 'One or more products are unavailable')
      subtotal += Number(product.price) * item.qty
      itemRecords.push({
        productId: product.id,
        name: product.name,
        unit: product.unit,
        image: product.image,
        price: product.price,
        qty: item.qty,
      })
    }

    const minOrderAmount = settings ? Number(settings.minOrderAmount) : 0
    if (subtotal < minOrderAmount) throw httpError(400, `The minimum order amount is ${minOrderAmount} ETB`)
    const couponCode = req.body.couponCode || req.body.promoCode
    const couponResult = await applyCoupon(tx, couponCode, subtotal)
    const threshold = settings ? Number(settings.freeDeliveryThreshold) : 500
    const standardFee = settings ? Number(settings.standardFee) : 50
    const expressFee = settings ? Number(settings.expressFee) : 100
    const isExpress = String(req.body.deliveryType || '').toLowerCase() === 'express'
    const deliveryFee = couponResult.freeDelivery || subtotal >= threshold ? 0 : isExpress ? expressFee : standardFee
    const discount = couponResult.discount
    const total = Math.max(0, subtotal - discount + deliveryFee)
    const code = orderCode()
    const created = await tx.order.create({
      data: {
        orderCode: code,
        customerId: req.user.id,
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        total: total.toFixed(2),
        couponCode: couponResult.coupon ? couponResult.coupon.code : null,
        deliveryZone,
        deliveryStreet,
        customerPhone,
        timeSlot,
        paymentMethod: method,
        paymentStatus: method === 'COD' ? 'PENDING_COD' : 'PENDING',
        orderStatus: 'PLACED',
        deliveryOtp: deliveryOtp(),
        items: { create: itemRecords },
      },
      include: { items: true, customer: { select: { id: true, fullName: true, email: true, phone: true } } },
    })

    await tx.transaction.create({
      data: {
        txnCode: `TXN-${code}`,
        orderId: created.id,
        userId: req.user.id,
        method,
        amount: total.toFixed(2),
        status: method === 'COD' ? 'PENDING_COD' : 'PENDING',
      },
    })
    await tx.notification.create({
      data: {
        title: 'New order received',
        message: `${code} was placed for ${total.toFixed(2)} ETB.`,
        category: 'ORDER',
        priority: 'NORMAL',
        actionPath: '/admin/orders',
      },
    })
    return created
  }, { isolationLevel: 'Serializable' })

  await logAudit({
    req,
    user: req.user,
    action: 'PLACE_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: `Placed order ${order.orderCode}.`,
  })
  return res.status(201).json({ order })
}

exports.myOrders = async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { customerId: req.user.id },
    include: { items: true, rider: { select: { id: true, fullName: true, phone: true, rating: true } }, transactions: true },
    orderBy: { createdAt: 'desc' },
  })
  return res.json({ orders })
}

exports.cancelOrder = async (req, res) => {
  const order = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findFirst({
      where: { id: req.params.id, customerId: req.user.id },
      include: { items: true, transactions: true },
    })
    if (!existing) throw httpError(404, 'Order not found')
    if (!['PLACED', 'CONFIRMED'].includes(existing.orderStatus)) {
      throw httpError(409, 'This order can no longer be canceled')
    }
    if (existing.paymentStatus === 'PAID') {
      throw httpError(409, 'Paid orders require payment refund processing before cancellation')
    }
    if (existing.transactions.some((transaction) => transaction.method === 'CHAPA' && transaction.txRef)) {
      throw httpError(409, 'A Chapa payment is in progress; verify or resolve it before canceling')
    }
    const updated = await tx.order.updateMany({
      where: { id: existing.id, orderStatus: { in: ['PLACED', 'CONFIRMED'] } },
      data: { orderStatus: 'CANCELED', paymentStatus: 'FAILED' },
    })
    if (updated.count !== 1) throw httpError(409, 'Order status changed; refresh and try again')
    await tx.transaction.updateMany({
      where: { orderId: existing.id, status: { in: ['PENDING', 'PENDING_COD'] } },
      data: { status: 'FAILED' },
    })
    for (const item of existing.items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.qty } } })
    }
    if (existing.couponCode) {
      await tx.coupon.updateMany({
        where: { code: existing.couponCode, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } },
      })
    }
    await tx.notification.create({
      data: {
        title: 'Order canceled',
        message: `${existing.orderCode} was canceled by the customer.`,
        category: 'ORDER',
        actionPath: '/admin/orders',
      },
    })
    return tx.order.findUnique({ where: { id: existing.id }, include: { items: true } })
  })
  await logAudit({
    req,
    user: req.user,
    action: 'CANCEL_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: `Canceled order ${order.orderCode}.`,
  })
  return res.json({ order })
}

exports.listOrders = async (req, res) => {
  const where = {}
  if (req.query.status) {
    where.orderStatus = String(req.query.status).toUpperCase()
    if (!['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELED'].includes(where.orderStatus)) {
      throw httpError(400, 'Invalid order status')
    }
  }
  if (req.query.search) {
    where.OR = [
      { orderCode: { contains: String(req.query.search), mode: 'insensitive' } },
      { customer: { fullName: { contains: String(req.query.search), mode: 'insensitive' } } },
      { customer: { email: { contains: String(req.query.search), mode: 'insensitive' } } },
    ]
  }
  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
      customer: { select: { id: true, fullName: true, email: true, phone: true } },
      rider: { select: { id: true, fullName: true, phone: true } },
      transactions: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return res.json({ orders: orders.map(({ deliveryOtp, ...order }) => order) })
}

exports.updateOrderStatus = async (req, res) => {
  const orderStatus = String(req.body.status || '').toUpperCase()
  if (!['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY'].includes(orderStatus)) {
    throw httpError(400, 'Invalid order status')
  }
  const existing = await prisma.order.findUnique({ where: { id: req.params.id }, select: { orderStatus: true, riderId: true } })
  if (!existing) throw httpError(404, 'Order not found')
  const transitions = { PLACED: 'CONFIRMED', CONFIRMED: 'PACKED', PACKED: 'OUT_FOR_DELIVERY' }
  if (orderStatus !== existing.orderStatus && transitions[existing.orderStatus] !== orderStatus) {
    throw httpError(409, `Cannot move an order from ${existing.orderStatus} to ${orderStatus}`)
  }
  if (orderStatus === 'OUT_FOR_DELIVERY') {
    if (!existing.riderId) throw httpError(409, 'Assign a rider before moving this order out for delivery')
  }
  const changed = await prisma.order.updateMany({
    where: { id: req.params.id, orderStatus: existing.orderStatus },
    data: { orderStatus },
  })
  if (!changed.count) throw httpError(409, 'Order status changed; refresh and try again')
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true, customer: { select: { id: true, fullName: true, email: true } } },
  })
  await logAudit({
    req,
    user: req.user,
    action: 'UPDATE_ORDER_STATUS',
    entity: 'Order',
    entityId: order.id,
    details: `Changed order ${order.orderCode} status from ${existing.orderStatus} to ${orderStatus}.`,
  })
  return res.json({ order })
}

exports.assignRider = async (req, res) => {
  const riderId = requiredString(req.body.riderId, 'riderId')
  const rider = await prisma.user.findFirst({ where: { id: riderId, role: 'DELIVERY', status: 'ACTIVE' } })
  if (!rider) throw httpError(404, 'Active delivery staff member not found')
  const existing = await prisma.order.findUnique({ where: { id: req.params.id }, select: { orderStatus: true } })
  if (!existing) throw httpError(404, 'Order not found')
  if (!['PLACED', 'CONFIRMED', 'PACKED'].includes(existing.orderStatus)) {
    throw httpError(409, 'Only orders that are not out for delivery can be assigned')
  }
  const changed = await prisma.order.updateMany({
    where: { id: req.params.id, orderStatus: { in: ['PLACED', 'CONFIRMED', 'PACKED'] } },
    data: { riderId },
  })
  if (!changed.count) throw httpError(409, 'Order was not found or is no longer assignable')
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { rider: { select: { id: true, fullName: true, phone: true } }, items: true },
  })
  await logAudit({
    req,
    user: req.user,
    action: 'ASSIGN_RIDER',
    entity: 'Order',
    entityId: order.id,
    details: `Assigned ${rider.fullName} to order ${order.orderCode}.`,
  })
  return res.json({ order })
}

exports.deliveryDashboard = async (req, res) => {
  const [user, orders] = await Promise.all([
    prisma.user.findUnique({ where: { id: req.user.id }, select: { isOnline: true, codCashHeld: true, assignedZone: true } }),
    prisma.order.findMany({
      where: { riderId: req.user.id },
      include: { items: true, customer: { select: { id: true, fullName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])
  return res.json({
    availability: user.isOnline,
    codCashHeld: user.codCashHeld,
    assignedZone: user.assignedZone,
    activeOrders: orders
      .filter((order) => !['DELIVERED', 'CANCELED'].includes(order.orderStatus))
      .map(({ deliveryOtp, ...order }) => order),
    completedOrders: orders
      .filter((order) => order.orderStatus === 'DELIVERED')
      .map(({ deliveryOtp, ...order }) => order),
  })
}

exports.updateAvailability = async (req, res) => {
  if (typeof req.body.isOnline !== 'boolean') throw httpError(400, 'isOnline must be a boolean')
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { isOnline: req.body.isOnline },
    select: { id: true, isOnline: true },
  })
  await logAudit({
    req,
    user: req.user,
    action: 'UPDATE_DELIVERY_AVAILABILITY',
    entity: 'User',
    entityId: user.id,
    details: `Delivery staff availability set to ${user.isOnline ? 'online' : 'offline'}.`,
  })
  return res.json({ user })
}

exports.advanceDelivery = async (req, res) => {
  const nextStatus = String(req.body.status || req.body.nextStatus || '').toUpperCase()
  const transitions = { PLACED: 'CONFIRMED', CONFIRMED: 'PACKED', PACKED: 'OUT_FOR_DELIVERY' }
  const requested = nextStatus || undefined
  const order = await prisma.order.findFirst({ where: { id: req.params.id, riderId: req.user.id } })
  if (!order) throw httpError(404, 'Assigned order not found')
  const target = requested || transitions[order.orderStatus]
  if (!target || transitions[order.orderStatus] !== target) {
    throw httpError(409, `Cannot advance an order from ${order.orderStatus}`)
  }
  const result = await prisma.order.updateMany({
    where: { id: order.id, riderId: req.user.id, orderStatus: order.orderStatus },
    data: { orderStatus: target },
  })
  if (result.count !== 1) throw httpError(409, 'Order status changed; refresh and try again')
  const updatedOrder = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true } })
  await logAudit({
    req,
    user: req.user,
    action: 'UPDATE_DELIVERY_STATUS',
    entity: 'Order',
    entityId: updatedOrder.id,
    details: `Advanced order ${updatedOrder.orderCode} to ${target}.`,
  })
  return res.json({ order: updatedOrder })
}

exports.declineDelivery = async (req, res) => {
  const result = await prisma.order.updateMany({
    where: { id: req.params.id, riderId: req.user.id, orderStatus: 'PLACED' },
    data: { riderId: null },
  })
  if (result.count !== 1) throw httpError(409, 'Only newly assigned orders can be declined')
  await logAudit({
    req,
    user: req.user,
    action: 'DECLINE_DELIVERY',
    entity: 'Order',
    entityId: req.params.id,
    details: `Declined delivery assignment for order ${req.params.id}.`,
  })
  return res.json({ message: 'Order assignment declined' })
}

exports.completeDelivery = async (req, res) => {
  const otp = requiredString(req.body.deliveryOtp || req.body.otp, 'deliveryOtp')
  if (!/^\d{4}$/.test(otp)) throw httpError(400, 'deliveryOtp must be a four-digit code')
  const order = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findFirst({
      where: { id: req.params.id, riderId: req.user.id },
      include: { items: true },
    })
    if (!existing) throw httpError(404, 'Assigned order not found')
    if (existing.orderStatus !== 'OUT_FOR_DELIVERY') throw httpError(409, 'Order must be out for delivery before completion')
    if (existing.deliveryOtp !== otp) throw httpError(400, 'Delivery OTP is incorrect')
    if (existing.paymentMethod === 'COD' && req.body.cashCollected !== true) {
      throw httpError(400, 'Confirm that the COD cash was collected')
    }
    const changed = await tx.order.updateMany({
      where: { id: existing.id, riderId: req.user.id, orderStatus: 'OUT_FOR_DELIVERY', deliveryOtp: otp },
      data: {
        orderStatus: 'DELIVERED',
        paymentStatus: existing.paymentMethod === 'COD' ? 'PAID' : existing.paymentStatus,
        deliveryNote: typeof req.body.note === 'string' ? req.body.note.trim() : existing.deliveryNote,
      },
    })
    if (changed.count !== 1) throw httpError(409, 'Order status changed; refresh and try again')
    if (existing.paymentMethod === 'COD') {
      await tx.user.update({ where: { id: req.user.id }, data: { codCashHeld: { increment: existing.total } } })
      await tx.transaction.updateMany({
        where: { orderId: existing.id, status: 'PENDING_COD' },
        data: { status: 'PAID' },
      })
    }
    await tx.notification.create({
      data: {
        title: 'Order delivered',
        message: `${existing.orderCode} was delivered successfully.`,
        category: 'ORDER',
        actionPath: '/admin/orders',
      },
    })
    return tx.order.findUnique({ where: { id: existing.id }, include: { items: true } })
  })
  await logAudit({
    req,
    user: req.user,
    action: 'COMPLETE_DELIVERY',
    entity: 'Order',
    entityId: order.id,
    details: `Completed order ${order.orderCode}.`,
  })
  return res.json({ order })
}

exports.reportDeliveryIssue = async (req, res) => {
  const issueReport = requiredString(req.body.issue || req.body.reason, 'issue')
  const result = await prisma.order.updateMany({
    where: { id: req.params.id, riderId: req.user.id, orderStatus: { notIn: ['DELIVERED', 'CANCELED'] } },
    data: { issueReport },
  })
  if (!result.count) throw httpError(404, 'Active assigned order not found')
  await logAudit({
    req,
    user: req.user,
    action: 'REPORT_DELIVERY_ISSUE',
    entity: 'Order',
    entityId: req.params.id,
    details: `Reported a delivery issue for order ${req.params.id}.`,
  })
  await prisma.notification.create({
    data: {
      title: 'Delivery issue reported',
      message: `Order ${req.params.id}: ${issueReport}`,
      category: 'ORDER',
      priority: 'HIGH',
      actionPath: '/admin/orders',
    },
  })
  return res.json({ message: 'Delivery issue reported' })
}
