import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Search, Filter, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import { invoiceService } from '../services/api'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../utils/formatters'
import clsx from 'clsx'

const STATUSES = ['', 'uploaded', 'parsed', 'verified', 'included_in_return']
const TYPES = ['', 'purchase', 'sale']

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const loadInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: 15 }
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.invoice_type = typeFilter
      const { data } = await invoiceService.list(params)
      setInvoices(data.invoices)
      setTotal(data.total)
      setTotalPages(data.total_pages)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, typeFilter])

  useEffect(() => { loadInvoices() }, [loadInvoices])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Invoices</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} total invoices</p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2">
          <Upload size={16} /> Upload
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="input pl-8 pr-8 py-2 text-sm appearance-none cursor-pointer min-w-[160px]"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All statuses'}</option>)}
          </select>
        </div>
        <div className="relative">
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
            className="input px-4 py-2 text-sm appearance-none cursor-pointer min-w-[140px]"
          >
            {TYPES.map(t => <option key={t} value={t}>{t ? `${t} invoices` : 'All types'}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner className="py-16" />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices found"
            description="Upload your first invoice to get started with AI-powered GST parsing."
            action={<Link to="/upload" className="btn-primary text-sm">Upload Invoice</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Invoice #', 'Supplier', 'Date', 'Taxable Amount', 'GST', 'Total', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-300">{inv.invoice_number || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-slate-200 font-medium truncate max-w-[160px]">{inv.supplier_name || inv.original_filename}</p>
                        {inv.supplier_gstin && <p className="text-xs text-slate-500 font-mono">{inv.supplier_gstin}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(inv.invoice_date)}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono">{formatCurrency(inv.taxable_amount)}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs space-y-0.5">
                        {inv.cgst > 0 && <p className="text-slate-400">C: {formatCurrency(inv.cgst)}</p>}
                        {inv.sgst > 0 && <p className="text-slate-400">S: {formatCurrency(inv.sgst)}</p>}
                        {inv.igst > 0 && <p className="text-slate-400">I: {formatCurrency(inv.igst)}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white font-mono">{formatCurrency(inv.total_amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3">
                      <Link to={`/invoices/${inv.id}`} className="text-primary-400 hover:text-primary-300 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost p-2">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost p-2">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
