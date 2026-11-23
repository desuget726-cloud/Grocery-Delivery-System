import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('token') ||
        window.sessionStorage.getItem('token')
      : null

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const createResourceService = (resource) => ({
  getAll: (params) => api.get(`/${resource}`, { params }),
  getById: (id) => api.get(`/${resource}/${id}`),
  create: (data) => api.post(`/${resource}`, data),
  update: (id, data) => api.put(`/${resource}/${id}`, data),
  remove: (id) => api.delete(`/${resource}/${id}`),
})

export const products = createResourceService('products')
export const categories = createResourceService('categories')
export const orders = createResourceService('orders')
export const customers = createResourceService('customers')
export const inventory = createResourceService('inventory')
export const delivery = createResourceService('deliveries')

export default api
