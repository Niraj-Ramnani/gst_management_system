export const formatCurrency = (val, symbol = '₹') => {
  if (val == null || isNaN(val)) return `${symbol}0`
  return `${symbol}${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatNumber = (val) => {
  if (val == null) return '0'
  return Number(val).toLocaleString('en-IN')
}

export const formatPercent = (val) => `${(Number(val) * 100).toFixed(1)}%`

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

export const getStatusBadge = (status) => {
  const map = {
    uploaded: 'badge-default',
    parsed: 'badge-info',
    verified: 'badge-success',
    included_in_return: 'badge-success',
  }
  return map[status] || 'badge-default'
}

export const getMonthName = (month) => {
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return names[(month - 1) % 12]
}

export const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
]

export const INDIAN_STATES = [
  { code: '01', name: 'Jammu & Kashmir' }, { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' }, { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' }, { code: '09', name: 'Uttar Pradesh' },
  { code: '19', name: 'West Bengal' }, { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' }, { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' }, { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' }, { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' }, { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
]
