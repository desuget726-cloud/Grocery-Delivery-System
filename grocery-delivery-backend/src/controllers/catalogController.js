const prisma = require('../config/prisma')
const { logAudit } = require('../utils/auditLogger')
const { httpError, requiredString } = require('../utils/http')

const productFields = [
  'name',
  'sku',
  'categoryId',
  'description',
  'price',
  'compareAtPrice',
  'unit',
  'stock',
  'lowStockThreshold',
  'expiryDate',
  'supplier',
  'image',
  'isFeatured',
  'isActive',
]

function pickProductData(body, partial) {
  const data = {}
  for (const field of productFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) data[field] = body[field]
  }
  if (!partial) {
    for (const field of ['name', 'sku', 'categoryId', 'price', 'unit']) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        throw httpError(400, `${field} is required`)
      }
    }
  }
  for (const field of ['name', 'sku', 'categoryId', 'unit']) {
    if (data[field] !== undefined) data[field] = requiredString(data[field], field)
  }
  if (data.price !== undefined && (!Number.isFinite(Number(data.price)) || Number(data.price) < 0)) {
    throw httpError(400, 'price must be a non-negative number')
  }
  if (data.compareAtPrice !== undefined && data.compareAtPrice !== null &&
      (!Number.isFinite(Number(data.compareAtPrice)) || Number(data.compareAtPrice) < 0)) {
    throw httpError(400, 'compareAtPrice must be a non-negative number or null')
  }
  if (data.stock !== undefined && (!Number.isInteger(Number(data.stock)) || Number(data.stock) < 0)) {
    throw httpError(400, 'stock must be a non-negative integer')
  }
  if (data.stock !== undefined) data.stock = Number(data.stock)
  if (data.lowStockThreshold !== undefined &&
      (!Number.isInteger(Number(data.lowStockThreshold)) || Number(data.lowStockThreshold) < 0)) {
    throw httpError(400, 'lowStockThreshold must be a non-negative integer')
  }
  if (data.lowStockThreshold !== undefined) data.lowStockThreshold = Number(data.lowStockThreshold)
  for (const field of ['isFeatured', 'isActive']) {
    if (data[field] !== undefined && typeof data[field] !== 'boolean') {
      throw httpError(400, `${field} must be a boolean`)
    }
  }
  if (data.expiryDate !== undefined && data.expiryDate !== null) {
    const date = new Date(data.expiryDate)
    if (Number.isNaN(date.getTime())) throw httpError(400, 'expiryDate must be a valid date')
    data.expiryDate = date
  }
  return data
}

exports.listProducts = async (req, res) => {
  const includeInactive = req.user && req.user.role === 'ADMIN' && req.query.includeInactive === 'true'
  const where = includeInactive ? {} : { isActive: true }
  const { search, category, onSale, maxPrice, sort } = req.query
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { description: { contains: String(search), mode: 'insensitive' } },
      { sku: { contains: String(search), mode: 'insensitive' } },
    ]
  }
  if (category) {
    where.category = { OR: [{ id: String(category) }, { slug: String(category) }] }
  }
  if (onSale === 'true') where.compareAtPrice = { not: null }
  if (maxPrice !== undefined) {
    const amount = Number(maxPrice)
    if (!Number.isFinite(amount) || amount < 0) throw httpError(400, 'maxPrice must be a non-negative number')
    where.price = { lte: amount }
  }
  const sortMap = {
    'price-asc': { price: 'asc' },
    'price-low': { price: 'asc' },
    'price-desc': { price: 'desc' },
    'price-high': { price: 'desc' },
    newest: { id: 'desc' },
    name: { name: 'asc' },
    popular: { rating: 'desc' },
    featured: { isFeatured: 'desc' },
  }
  const orderBy = sortMap[sort] || { name: 'asc' }
  let products = await prisma.product.findMany({ where, orderBy, include: { category: true } })
  if (onSale === 'true') {
    products = products.filter((product) =>
      product.compareAtPrice !== null && Number(product.compareAtPrice) > Number(product.price),
    )
  }
  return res.json({ products })
}

exports.getProduct = async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, isActive: true },
    include: { category: true, reviews: { where: { status: 'PUBLISHED' }, include: { user: { select: { id: true, fullName: true, avatar: true } } } } },
  })
  if (!product) throw httpError(404, 'Product not found')
  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
    take: 8,
    orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
    include: { category: true },
  })
  return res.json({ product, relatedProducts })
}

exports.createProduct = async (req, res) => {
  const data = pickProductData(req.body, false)
  try {
    const product = await prisma.product.create({ data, include: { category: true } })
    await logAudit({
      req,
      user: req.user,
      action: 'CREATE_PRODUCT',
      entity: 'Product',
      entityId: product.id,
      details: `Created product ${product.name} (${product.sku}).`,
    })
    return res.status(201).json({ product })
  } catch (error) {
    if (error.code === 'P2002') throw httpError(409, 'A product with this SKU already exists')
    if (error.code === 'P2003') throw httpError(400, 'The selected category does not exist')
    throw error
  }
}

exports.updateProduct = async (req, res) => {
  const data = pickProductData(req.body, true)
  if (!Object.keys(data).length) throw httpError(400, 'Provide at least one product field to update')
  try {
    const product = await prisma.product.update({ where: { id: req.params.id }, data, include: { category: true } })
    await logAudit({
      req,
      user: req.user,
      action: 'UPDATE_PRODUCT',
      entity: 'Product',
      entityId: product.id,
      details: `Updated product fields: ${Object.keys(data).join(', ')}.`,
    })
    return res.json({ product })
  } catch (error) {
    if (error.code === 'P2025') throw httpError(404, 'Product not found')
    if (error.code === 'P2002') throw httpError(409, 'A product with this SKU already exists')
    if (error.code === 'P2003') throw httpError(400, 'The selected category does not exist')
    throw error
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } })
    await logAudit({
      req,
      user: req.user,
      action: 'DELETE_PRODUCT',
      entity: 'Product',
      entityId: product.id,
      details: `Archived product ${product.name} (${product.sku}).`,
    })
    return res.json({ message: 'Product archived' })
  } catch (error) {
    if (error.code === 'P2025') throw httpError(404, 'Product not found')
    throw error
  }
}

exports.updateStock = async (req, res) => {
  const quantity = Number(req.body.quantity)
  const type = req.body.type || (quantity >= 0 ? 'RESTOCK' : 'DAMAGED')
  if (!Number.isInteger(quantity) || quantity === 0) throw httpError(400, 'quantity must be a non-zero integer adjustment')
  if (!['RESTOCK', 'SALE', 'DAMAGED', 'EXPIRED'].includes(type)) {
    throw httpError(400, 'type must be RESTOCK, SALE, DAMAGED, or EXPIRED')
  }
  if ((type === 'RESTOCK' && quantity < 0) || (type !== 'RESTOCK' && quantity > 0)) {
    throw httpError(400, 'The stock adjustment sign does not match the movement type')
  }

  const product = await prisma.$transaction(async (tx) => {
    const changed = await tx.product.updateMany({
      where: {
        id: req.params.id,
        ...(quantity < 0 ? { stock: { gte: Math.abs(quantity) } } : {}),
      },
      data: {
        stock: quantity > 0
          ? { increment: quantity }
          : { decrement: Math.abs(quantity) },
      },
    })
    if (changed.count !== 1) {
      const current = await tx.product.findUnique({ where: { id: req.params.id }, select: { id: true } })
      if (!current) throw httpError(404, 'Product not found')
      throw httpError(409, 'Stock cannot be reduced below zero')
    }
    await tx.stockMovement.create({
      data: {
        productId: req.params.id,
        type,
        quantity: Math.abs(quantity),
        note: typeof req.body.note === 'string' ? req.body.note.trim() : null,
        createdBy: req.user.id,
      },
    })
    return tx.product.findUnique({ where: { id: req.params.id }, include: { category: true } })
  })
  await logAudit({
    req,
    user: req.user,
    action: 'UPDATE_PRODUCT_STOCK',
    entity: 'Product',
    entityId: product.id,
    details: `${type} adjustment of ${Math.abs(quantity)} units for ${product.name}.`,
  })
  return res.json({ product })
}

exports.listCategories = async (req, res) => {
  const includeInactive = req.user && req.user.role === 'ADMIN' && req.query.includeInactive === 'true'
  const categories = await prisma.category.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  })
  return res.json({ categories })
}

exports.getCategory = async (req, res) => {
  const category = await prisma.category.findFirst({
    where: { OR: [{ id: req.params.id }, { slug: req.params.id }], isActive: true },
    include: { products: { where: { isActive: true }, orderBy: { name: 'asc' } } },
  })
  if (!category) throw httpError(404, 'Category not found')
  return res.json({ category })
}

function categoryData(body, partial) {
  const fields = ['name', 'slug', 'description', 'image', 'displayOrder', 'isActive', 'isFeatured']
  const data = {}
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) data[field] = body[field]
  }
  if (!partial && (!data.name || !data.slug)) throw httpError(400, 'name and slug are required')
  if (data.name !== undefined) data.name = requiredString(data.name, 'name')
  if (data.slug !== undefined) data.slug = requiredString(data.slug, 'slug').toLowerCase()
  if (data.displayOrder !== undefined && (!Number.isInteger(Number(data.displayOrder)) || Number(data.displayOrder) < 0)) {
    throw httpError(400, 'displayOrder must be a non-negative integer')
  }
  if (data.displayOrder !== undefined) data.displayOrder = Number(data.displayOrder)
  for (const field of ['isActive', 'isFeatured']) {
    if (data[field] !== undefined && typeof data[field] !== 'boolean') throw httpError(400, `${field} must be a boolean`)
  }
  return data
}

exports.createCategory = async (req, res) => {
  try {
    const category = await prisma.category.create({ data: categoryData(req.body, false) })
    await logAudit({
      req,
      user: req.user,
      action: 'CREATE_CATEGORY',
      entity: 'Category',
      entityId: category.id,
      details: `Created category ${category.name}.`,
    })
    return res.status(201).json({ category })
  } catch (error) {
    if (error.code === 'P2002') throw httpError(409, 'A category with this slug already exists')
    throw error
  }
}

exports.updateCategory = async (req, res) => {
  const data = categoryData(req.body, true)
  if (!Object.keys(data).length) throw httpError(400, 'Provide at least one category field to update')
  try {
    const category = await prisma.category.update({ where: { id: req.params.id }, data })
    await logAudit({
      req,
      user: req.user,
      action: 'UPDATE_CATEGORY',
      entity: 'Category',
      entityId: category.id,
      details: `Updated category fields: ${Object.keys(data).join(', ')}.`,
    })
    return res.json({ category })
  } catch (error) {
    if (error.code === 'P2025') throw httpError(404, 'Category not found')
    if (error.code === 'P2002') throw httpError(409, 'A category with this slug already exists')
    throw error
  }
}

exports.deleteCategory = async (req, res) => {
  const count = await prisma.product.count({ where: { categoryId: req.params.id } })
  if (count) throw httpError(409, 'This category still contains products; move or archive them first')
  try {
    const category = await prisma.category.delete({ where: { id: req.params.id } })
    await logAudit({
      req,
      user: req.user,
      action: 'DELETE_CATEGORY',
      entity: 'Category',
      entityId: category.id,
      details: `Deleted category ${category.name}.`,
    })
    return res.json({ message: 'Category deleted' })
  } catch (error) {
    if (error.code === 'P2025') throw httpError(404, 'Category not found')
    throw error
  }
}

exports.getWishlist = async (req, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user.id },
    include: { product: { include: { category: true } } },
    orderBy: { id: 'desc' },
  })
  return res.json({ items, products: items.map((item) => item.product) })
}

exports.toggleWishlist = async (req, res) => {
  const product = await prisma.product.findFirst({ where: { id: req.params.productId, isActive: true } })
  if (!product) throw httpError(404, 'Product not found')
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: req.user.id, productId: product.id } },
  })
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } })
    return res.json({ added: false, productId: product.id })
  }
  const item = await prisma.wishlistItem.create({
    data: { userId: req.user.id, productId: product.id },
    include: { product: true },
  })
  return res.status(201).json({ added: true, item })
}
