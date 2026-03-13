import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

const token = localStorage.getItem('token')
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const invoiceService = {
  upload: (file, invoiceType) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('invoice_type', invoiceType)
    return api.post('/invoices/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  list: (params) => api.get('/invoices', { params }),
  get: (id) => api.get(`/invoices/${id}`),
  review: (id, data) => api.put(`/invoices/${id}/review`, data),
  reparse: (id) => api.post(`/invoices/${id}/reparse`),
}

export const businessService = {
  getProfile: () => api.get('/business/profile'),
  createProfile: (data) => api.post('/business/profile', data),
  updateProfile: (data) => api.put('/business/profile', data),
}

export const returnsService = {
  getSummary: (month, year) => api.get('/returns/monthly-summary', { params: { month, year } }),
  generate: (month, year) => api.post('/returns/generate', null, { params: { month, year } }),
}

export const forecastService = {
  nextMonth: () => api.get('/forecast/next-month'),
  train: () => api.post('/forecast/train'),
}

export const reportService = {
  invoiceSummary: (params) => api.get('/reports/invoice-summary', { params }),
  taxSummary: (params) => api.get('/reports/tax-summary', { params }),
}

