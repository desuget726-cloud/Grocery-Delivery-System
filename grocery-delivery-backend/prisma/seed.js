require('dotenv').config()

const bcrypt = require('bcryptjs')
const prisma = require('../src/config/prisma')

const categories = [
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', description: 'Fresh seasonal produce', displayOrder: 1, isFeatured: true },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', description: 'Everyday dairy and farm-fresh eggs', displayOrder: 2 },
  { name: 'Meat & Poultry', slug: 'meat-poultry', description: 'Freshly prepared meat and poultry', displayOrder: 3 },
  { name: 'Bakery', slug: 'bakery', description: 'Fresh bread and baked goods', displayOrder: 4 },
  { name: 'Pantry Staples', slug: 'pantry-staples', description: 'Essential grains, spices, and cooking ingredients', displayOrder: 5, isFeatured: true },
  { name: 'Beverages', slug: 'beverages', description: 'Drinks for every occasion', displayOrder: 6 },
  { name: 'Snacks', slug: 'snacks', description: 'Tasty bites and treats', displayOrder: 7 },
  { name: 'Household Essentials', slug: 'household-essentials', description: 'Useful everyday home supplies', displayOrder: 8 },
]

const productFixtures = [
  { sku: 'FRU-APL-001', name: 'Fresh Apples', category: 'fruits-vegetables', description: 'Crisp, sweet apples selected for freshness.', price: '180.00', compareAtPrice: '200.00', unit: 'kg', stock: 65, supplier: 'Bole Fresh Farms', isFeatured: true },
  { sku: 'FRU-AVO-004', name: 'Hass Avocados', category: 'fruits-vegetables', description: 'Creamy, ready-to-enjoy Ethiopian avocados.', price: '140.00', unit: 'kg', stock: 37, supplier: 'Rift Valley Produce' },
  { sku: 'DAI-MIL-005', name: 'Fresh Whole Milk', category: 'dairy-eggs', description: 'Locally produced whole milk.', price: '95.00', unit: '1 L', stock: 40, supplier: 'Addis Dairy Cooperative' },
  { sku: 'DAI-EGG-006', name: 'Farm Fresh Eggs', category: 'dairy-eggs', description: 'A tray of 30 fresh farm eggs.', price: '360.00', unit: 'tray of 30', stock: 24, supplier: 'Green Hill Poultry' },
  { sku: 'MEA-CHI-007', name: 'Chicken Breast', category: 'meat-poultry', description: 'Boneless, skinless chicken breast.', price: '520.00', unit: 'kg', stock: 18, supplier: 'Addis Poultry' },
  { sku: 'BAK-ING-008', name: 'Fresh Injera', category: 'bakery', description: 'Soft, freshly prepared teff injera.', price: '45.00', unit: 'piece', stock: 50, supplier: 'Enat Bakery', isFeatured: true },
  { sku: 'PAN-TEF-009', name: 'White Teff', category: 'pantry-staples', description: 'Premium Ethiopian white teff grain.', price: '210.00', unit: 'kg', stock: 100, supplier: 'Oromia Grain Cooperative' },
  { sku: 'PAN-COF-010', name: 'Yirgacheffe Coffee', category: 'pantry-staples', description: 'Aromatic single-origin Ethiopian coffee beans.', price: '480.00', unit: '500 g', stock: 30, supplier: 'Yirgacheffe Coffee Union', isFeatured: true },
  { sku: 'PAN-HON-011', name: 'Natural Honey', category: 'pantry-staples', description: 'Pure, locally sourced wildflower honey.', price: '320.00', unit: '500 g', stock: 28, supplier: 'Highland Apiaries' },
  { sku: 'BEV-WAT-012', name: 'Mineral Water', category: 'beverages', description: 'Pure bottled mineral water.', price: '35.00', unit: '1.5 L', stock: 100, supplier: 'Addis Springs' },
  { sku: 'SNA-ROA-012', name: 'Roasted Peanuts', category: 'snacks', description: 'Lightly salted, freshly roasted peanuts.', price: '85.00', unit: '250 g', stock: 45, supplier: 'Addis Nut Roasters' },
  { sku: 'HOU-TOW-013', name: 'Paper Towels', category: 'household-essentials', description: 'Absorbent paper towels for everyday household use.', price: '160.00', unit: '6 rolls', stock: 32, supplier: 'Addis Home Supplies' },
]

async function main() {
  const passwordHashes = {
    customer: await bcrypt.hash('Customer@123', 12),
    delivery: await bcrypt.hash('Delivery@123', 12),
    admin: await bcrypt.hash('Admin@123', 12),
  }

  const customer = await prisma.user.upsert({
    where: { email: 'customer@grocery.et' },
    update: { fullName: 'Abebe Kebede', passwordHash: passwordHashes.customer, role: 'CUSTOMER', status: 'ACTIVE' },
    create: { fullName: 'Abebe Kebede', email: 'customer@grocery.et', phone: '+251911000001', passwordHash: passwordHashes.customer, role: 'CUSTOMER' },
  })

  const delivery = await prisma.user.upsert({
    where: { email: 'delivery@grocery.et' },
    update: { fullName: 'Dawit Tadesse', passwordHash: passwordHashes.delivery, role: 'DELIVERY', status: 'ACTIVE', vehicleType: 'Motorbike', plateNumber: 'AA-23451', assignedZone: 'Bole' },
    create: { fullName: 'Dawit Tadesse', email: 'delivery@grocery.et', phone: '+251911000002', passwordHash: passwordHashes.delivery, role: 'DELIVERY', vehicleType: 'Motorbike', plateNumber: 'AA-23451', assignedZone: 'Bole' },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@grocery.et' },
    update: { fullName: 'Administrator', passwordHash: passwordHashes.admin, role: 'ADMIN', status: 'ACTIVE' },
    create: { fullName: 'Administrator', email: 'admin@grocery.et', phone: '+251911000003', passwordHash: passwordHashes.admin, role: 'ADMIN' },
  })

  const categoryBySlug = {}
  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
    categoryBySlug[saved.slug] = saved
  }

  const productsBySku = {}
  for (const fixture of productFixtures) {
    const { category: categorySlug, ...fields } = fixture
    const data = {
      ...fields,
      categoryId: categoryBySlug[categorySlug].id,
      image: null,
      isActive: true,
      lowStockThreshold: 5,
    }
    const product = await prisma.product.upsert({
      where: { sku: fixture.sku },
      update: data,
      create: data,
    })
    productsBySku[product.sku] = product
  }

  await prisma.address.upsert({
    where: { id: 'seed-customer-address' },
    update: { userId: customer.id, label: 'Home', zone: 'Bole', street: 'Bole Road, Addis Ababa', isDefault: true },
    create: { id: 'seed-customer-address', userId: customer.id, label: 'Home', zone: 'Bole', street: 'Bole Road, Addis Ababa', isDefault: true },
  })

  const couponFixtures = [
    { code: 'WELCOME10', description: '10% off your first order', discountType: 'PERCENTAGE', value: '10.00', minOrder: '300.00', usageLimit: 1000 },
    { code: 'FRESH100', description: '100 ETB off fresh groceries', discountType: 'FIXED', value: '100.00', minOrder: '500.00', usageLimit: 500 },
    { code: 'FREEDEL', description: 'Free delivery on your next order', discountType: 'FREE_DELIVERY', value: '0.00', minOrder: '250.00', usageLimit: 300 },
    { code: 'WEEKEND15', description: '15% off weekend shopping', discountType: 'PERCENTAGE', value: '15.00', minOrder: '400.00', usageLimit: 200 },
  ]
  for (const coupon of couponFixtures) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: { ...coupon, isActive: true, expiryDate: null },
      create: { ...coupon, isActive: true },
    })
  }

  const orderFixtures = [
    {
      orderCode: 'GDS-2538',
      subtotal: '585.00',
      discount: '58.50',
      deliveryFee: '0.00',
      total: '526.50',
      couponCode: 'WELCOME10',
      deliveryZone: 'Bole',
      deliveryStreet: 'Bole Road, Addis Ababa',
      customerPhone: customer.phone,
      timeSlot: '10:00 - 12:00',
      paymentMethod: 'CHAPA',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      deliveryOtp: '4831',
      riderId: delivery.id,
      items: [{ sku: 'FRU-APL-001', qty: 1 }, { sku: 'DAI-EGG-006', qty: 1 }, { sku: 'BAK-ING-008', qty: 1 }],
    },
    {
      orderCode: 'GDS-2531',
      subtotal: '530.00',
      discount: '0.00',
      deliveryFee: '50.00',
      total: '580.00',
      deliveryZone: 'Bole',
      deliveryStreet: 'Bole Road, Addis Ababa',
      customerPhone: customer.phone,
      timeSlot: '14:00 - 16:00',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING_COD',
      orderStatus: 'OUT_FOR_DELIVERY',
      deliveryOtp: '7264',
      riderId: delivery.id,
      items: [{ sku: 'PAN-TEF-009', qty: 1 }, { sku: 'PAN-HON-011', qty: 1 }],
    },
  ]

  for (const fixture of orderFixtures) {
    const { items, ...orderData } = fixture
    await prisma.order.upsert({
      where: { orderCode: fixture.orderCode },
      update: orderData,
      create: {
        ...orderData,
        customerId: customer.id,
        items: {
          create: items.map(({ sku, qty }) => {
            const product = productsBySku[sku]
            return {
              productId: product.id,
              name: product.name,
              unit: product.unit,
              image: product.image,
              price: product.price,
              qty,
            }
          }),
        },
      },
    })
  }

  const transactionFixtures = [
    { txnCode: 'TXN-GDS-2538', orderCode: 'GDS-2538', method: 'CHAPA', amount: '526.50', status: 'PAID', txRef: 'chapa-seed-2538' },
    { txnCode: 'TXN-GDS-2531', orderCode: 'GDS-2531', method: 'COD', amount: '580.00', status: 'PENDING_COD', txRef: null },
  ]
  for (const transaction of transactionFixtures) {
    const { orderCode, ...data } = transaction
    await prisma.transaction.upsert({
      where: { txnCode: transaction.txnCode },
      update: data,
      create: { ...data, orderId: (await prisma.order.findUniqueOrThrow({ where: { orderCode } })).id, userId: customer.id },
    })
  }

  const review = {
    productId: productsBySku['FRU-APL-001'].id,
    userId: customer.id,
    orderCode: 'GDS-2538',
    rating: 5,
    comment: 'Fresh, crisp apples and quick delivery. Thank you!',
    adminReply: null,
    status: 'PUBLISHED',
  }
  await prisma.review.upsert({
    where: {
      productId_userId_orderCode: {
        productId: review.productId,
        userId: review.userId,
        orderCode: review.orderCode,
      },
    },
    update: review,
    create: review,
  })

  const ticket = {
    ticketCode: 'TKT-1001',
    userId: customer.id,
    name: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    orderCode: 'GDS-2531',
    topic: 'Delivery status',
    messages: [
      { sender: 'customer', message: 'Could you please confirm the delivery estimate?' },
      { sender: 'support', message: 'Your order is on its way and should arrive shortly.' },
    ],
    status: 'IN_PROGRESS',
  }
  await prisma.supportTicket.upsert({
    where: { ticketCode: ticket.ticketCode },
    update: ticket,
    create: ticket,
  })

  const notificationFixtures = [
    { id: 'seed-order-notification', title: 'Order delivered', message: 'Order GDS-2538 was delivered successfully.', category: 'ORDER', priority: 'NORMAL', actionPath: '/admin/orders' },
    { id: 'seed-stock-notification', title: 'Inventory reminder', message: 'Review stock levels before the next delivery window.', category: 'INVENTORY', priority: 'LOW', actionPath: '/admin/inventory' },
  ]
  for (const notification of notificationFixtures) {
    await prisma.notification.upsert({
      where: { id: notification.id },
      update: notification,
      create: notification,
    })
  }

  await prisma.storeSetting.upsert({
    where: { id: 'default' },
    update: {
      storeName: 'Grocery Delivery System',
      tagline: 'Fresh groceries, delivered with care.',
      supportEmail: 'support@grocery.et',
      supportPhone: '+251911000000',
      warehouseAddress: 'Addis Ababa, Ethiopia',
      isStoreOpen: true,
      freeDeliveryThreshold: '500.00',
      standardFee: '50.00',
      expressFee: '100.00',
      minOrderAmount: '150.00',
      vatRate: '0.1500',
      requireDeliveryOtp: true,
      zones: ['Bole', 'Kazanchis', 'CMC', 'Piassa', 'Sarbet'],
      paymentGateways: { telebirr: true, cbeBirr: true, chapa: true, cashOnDelivery: true },
      timeSlots: ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'],
    },
    create: {
      id: 'default',
      storeName: 'Grocery Delivery System',
      tagline: 'Fresh groceries, delivered with care.',
      supportEmail: 'support@grocery.et',
      supportPhone: '+251911000000',
      warehouseAddress: 'Addis Ababa, Ethiopia',
      freeDeliveryThreshold: '500.00',
      standardFee: '50.00',
      expressFee: '100.00',
      minOrderAmount: '150.00',
      vatRate: '0.1500',
      zones: ['Bole', 'Kazanchis', 'CMC', 'Piassa', 'Sarbet'],
      paymentGateways: { telebirr: true, cbeBirr: true, chapa: true, cashOnDelivery: true },
      timeSlots: ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'],
    },
  })

  const seededOrder = await prisma.order.findUniqueOrThrow({ where: { orderCode: 'GDS-2531' } })
  const auditFixtures = [
    {
      id: 'seed-audit-admin-login',
      actorId: admin.id,
      actorName: admin.fullName,
      actorRole: admin.role,
      action: 'ADMIN_LOGIN',
      entity: 'User',
      entityId: admin.id,
      details: 'Seed audit sample: administrator signed in.',
    },
    {
      id: 'seed-audit-settings-update',
      actorId: admin.id,
      actorName: admin.fullName,
      actorRole: admin.role,
      action: 'UPDATE_SETTINGS',
      entity: 'StoreSetting',
      entityId: 'default',
      details: 'Seed audit sample: store delivery settings updated.',
    },
    {
      id: 'seed-audit-product-create',
      actorId: admin.id,
      actorName: admin.fullName,
      actorRole: admin.role,
      action: 'CREATE_PRODUCT',
      entity: 'Product',
      entityId: productsBySku['FRU-APL-001'].id,
      details: 'Seed audit sample: Fresh Apples product created.',
    },
    {
      id: 'seed-audit-rider-assignment',
      actorId: admin.id,
      actorName: admin.fullName,
      actorRole: admin.role,
      action: 'ASSIGN_RIDER',
      entity: 'Order',
      entityId: seededOrder.id,
      details: `Seed audit sample: ${delivery.fullName} assigned to ${seededOrder.orderCode}.`,
    },
  ]
  for (const audit of auditFixtures) {
    await prisma.auditLog.upsert({
      where: { id: audit.id },
      update: audit,
      create: audit,
    })
  }

  console.log('Seed complete: users, catalog, coupons, orders, and store data are ready.')
  console.log(`Seed accounts: ${customer.email}, ${delivery.email}, ${admin.email}`)
}

main()
  .catch((error) => {
    console.error('Database seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
