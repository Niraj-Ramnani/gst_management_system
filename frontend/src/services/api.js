import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? (import.meta.env.VITE_API_URL.endsWith('/api/v1') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api/v1`)
    : '/api/v1',
  timeout: 30000,
})

const token = localStorage.getItem('token')
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      // Only redirect if we're not already on the login page to avoid refresh loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
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
  exportExcel: (params) => api.get('/invoices/export', { params, responseType: 'blob' }),
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

