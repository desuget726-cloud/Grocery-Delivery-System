import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('token') || window.sessionStorage.getItem('token')
      : null
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getApiErrorMessage(error, fallback = 'The request could not be completed.') {
  return error?.response?.data?.error || error?.response?.data?.message || error?.message || fallback
}

export function normalizeRole(role) {
  return String(role || '').toLowerCase()
}

export function normalizeProduct(product) {
  if (!product) return product
  const category = product.category?.name || product.category || ''
  return {
    ...product,
    category,
    categoryId: product.categoryId || product.category?.id,
    imageUrl: product.imageUrl || product.image || '',
    originalPrice: product.originalPrice ?? product.compareAtPrice ?? null,
    active: product.active ?? product.isActive ?? true,
    featured: product.featured ?? product.isFeatured ?? false,
    inStock: Number(product.stock) > 0,
  }
}

export function normalizeOrder(order) {
  if (!order) return order
  const paymentMethods = {
    COD: 'Cash on Delivery',
    CHAPA: 'Chapa Card',
    CBE_BIRR: 'CBE Birr',
    TELEBIRR: 'Telebirr',
  }
  const orderStatuses = {
    PLACED: 'Placed',
    CONFIRMED: 'Confirmed',
    PACKED: 'Packed',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELED: 'Canceled',
  }
  const customer = order.customer || {}
  return {
    ...order,
    code: order.orderCode,
    customerId: order.customerId || customer.id,
    customerName: customer.fullName || order.customerName || '',
    email: customer.email || order.email || '',
    status: orderStatuses[order.orderStatus] || order.orderStatus || order.status,
    paymentMethod: paymentMethods[order.paymentMethod] || order.paymentMethod,
    paymentStatus: order.paymentStatus,
    date: order.createdAt || order.date,
    address: {
      name: customer.fullName || order.customerName || '',
      phone: order.customerPhone || customer.phone || '',
      zone: order.deliveryZone || '',
      street: order.deliveryStreet || '',
      city: 'Addis Ababa',
    },
    items: (order.items || []).map((item) => ({
      ...item,
      id: item.productId || item.id,
      orderItemId: item.id,
      productId: item.productId,
      quantity: item.qty ?? item.quantity,
      imageUrl: item.imageUrl || item.image || '',
    })),
  }
}

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  createAddress: (data) => api.post('/auth/addresses', data),
  setDefaultAddress: (id) => api.patch(`/auth/addresses/${id}/default`),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (email, otp, newPassword) =>
    api.post('/auth/reset-password', { email, otp, newPassword }),
}

export const products = {
  async getAll(params) {
    const { data } = await api.get('/products', { params })
    return (data.products || []).map(normalizeProduct)
  },
  async getById(id) {
    const { data } = await api.get(`/products/${id}`)
    return { ...data, product: normalizeProduct(data.product), relatedProducts: (data.relatedProducts || []).map(normalizeProduct) }
  },
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),
}

export const categories = {
  async getAll(params) {
    const { data } = await api.get('/categories', { params })
    return data.categories || []
  },
  async getById(id) {
    const { data } = await api.get(`/categories/${id}`)
    return data.category
  },
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
}

export const wishlist = {
  async getAll() {
    const { data } = await api.get('/wishlist')
    return (data.products || data.items?.map((item) => item.product) || []).map(normalizeProduct)
  },
  toggle: (productId) => api.post(`/wishlist/toggle/${productId}`),
}

export const orders = {
  async getMyOrders() {
    const { data } = await api.get('/orders/my-orders')
    return (data.orders || []).map(normalizeOrder)
  },
  async getAll(params) {
    const { data } = await api.get('/orders', { params })
    return (data.orders || []).map(normalizeOrder)
  },
  async create(data) {
    const response = await api.post('/orders', data)
    return { ...response, data: { ...response.data, order: normalizeOrder(response.data.order) } }
  },
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  assignRider: (id, riderId) => api.patch(`/orders/${id}/assign-rider`, { riderId }),
}

export const delivery = {
  async getDashboard() {
    const { data } = await api.get('/delivery/dashboard')
    return {
      ...data,
      activeOrders: (data.activeOrders || []).map(normalizeOrder),
      completedOrders: (data.completedOrders || []).map(normalizeOrder),
    }
  },
  setAvailability: (isOnline) => api.patch('/delivery/availability', { isOnline }),
  advance: (id, status) => api.patch(`/delivery/orders/${id}/advance`, { status }),
  complete: (id, data) => api.post(`/delivery/orders/${id}/complete`, data),
  issue: (id, issue) => api.post(`/delivery/orders/${id}/issue`, { issue }),
  decline: (id) => api.patch(`/delivery/orders/${id}/decline`),
}

export const customers = {
  getAll: (params) => api.get('/admin/customers', { params }),
  create: (data) => api.post('/admin/customers', data),
  update: (id, data) => api.put(`/admin/customers/${id}`, data),
  remove: (id) => api.delete(`/admin/customers/${id}`),
}

export const deliveryStaff = {
  getAll: (params) => api.get('/admin/delivery-staff', { params }),
  create: (data) => api.post('/admin/delivery-staff', data),
  update: (id, data) => api.put(`/admin/delivery-staff/${id}`, data),
  remove: (id) => api.delete(`/admin/delivery-staff/${id}`),
}

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  weeklyRevenue: () => api.get('/admin/revenue/weekly'),
  lowStock: () => api.get('/admin/inventory/low-stock'),
  orderDetail: (id) => api.get(`/admin/orders/${id}`),
  auditLogs: (params) => api.get('/admin/audit-logs', { params }),
}

export const coupons = {
  getAll: () => api.get('/coupons'),
  validate: (data) => api.post('/coupons/validate', data),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  remove: (id) => api.delete(`/coupons/${id}`),
}

export const payments = {
  initializeChapa: (orderId) => api.post('/payments/chapa/initialize', { orderId }),
  verifyChapa: (txRef) => api.post('/payments/chapa/verify', { txRef }),
  settleCod: (data) => api.post('/payments/cod/settle', data),
  getAll: (params) => api.get('/payments', { params }),
}

export const reviews = {
  getAll: (params) => api.get('/reviews/manage', { params }),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.patch(`/reviews/${id}`, data),
  remove: (id) => api.delete(`/reviews/${id}`),
}

export const support = {
  getAll: () => api.get('/support'),
  getMine: () => api.get('/support/mine'),
  create: (data) => api.post('/support', data),
  update: (id, data) => api.patch(`/support/${id}`, data),
  remove: (id) => api.delete(`/support/${id}`),
}

export const notifications = {
  getAll: () => api.get('/notifications'),
  create: (data) => api.post('/notifications', data),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  remove: (id) => api.delete(`/notifications/${id}`),
}

export const settings = {
  getPublic: () => api.get('/settings/public'),
  update: (data) => api.put('/settings', data),
}

export default api
