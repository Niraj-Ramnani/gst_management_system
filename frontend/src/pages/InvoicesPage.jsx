import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FileText, Search, Filter, Upload, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { invoiceService } from '../services/api'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../utils/formatters'
import clsx from 'clsx'

const STATUSES = ['', 'uploaded', 'parsed', 'verified', 'included_in_return']
const TYPES = ['', 'purchase', 'sale']

export default function InvoicesPage() {
  const navigate = useNavigate()
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
    <div className="space-y-6 sm:space-y-8 animate-in">
      <div className="page-header !mb-6 sm:!mb-10">
        <div>
          <h1 className="section-title text-xl sm:text-2xl">Invoice Repository</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{total} processed documents</p>
        </div>
        <Link to="/upload" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group">
          <Upload size={16} className="group-hover:-translate-y-0.5 transition-transform" /> Scan New
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
        <div className="relative shrink-0">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="input pl-9 pr-8 py-2 text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer min-w-[150px] bg-slate-900/40"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All statuses'}</option>)}
          </select>
        </div>
        <div className="relative shrink-0">
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
            className="input px-4 py-2 text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer min-w-[130px] bg-slate-900/40"
          >
            {TYPES.map(t => <option key={t} value={t}>{t ? `${t}s` : 'All Types'}</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="card py-16 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={FileText}
              title="No invoices found"
              description="Upload your first invoice to get started with AI-powered GST parsing."
              action={<Link to="/upload" className="btn-primary text-xs uppercase font-black">Get Started</Link>}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      {['Invoice #', 'Supplier', 'Date', 'Taxable', 'GST Details', 'Total Amount', 'Status', ''].map(h => (
                        <th key={h} className="text-left px-6 py-4 text-slate-500 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-slate-400">{inv.invoice_number || '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-slate-100 font-bold truncate max-w-[200px]">{inv.supplier_name || inv.original_filename}</p>
                            {inv.supplier_gstin && <p className="text-[10px] text-slate-500 font-mono tracking-tight">{inv.supplier_gstin}</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">{formatDate(inv.invoice_date)}</td>
                        <td className="px-6 py-4 text-slate-300 font-bold text-xs">{formatCurrency(inv.taxable_amount)}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                             {inv.cgst > 0 && <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">C:{formatCurrency(inv.cgst)}</span>}
                             {inv.sgst > 0 && <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">S:{formatCurrency(inv.sgst)}</span>}
                             {inv.igst > 0 && <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">I:{formatCurrency(inv.igst)}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-white">{formatCurrency(inv.total_amount)}</td>
                        <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                        <td className="px-6 py-4 text-right">
                          <ArrowRight size={14} className="text-slate-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
              {invoices.map(inv => (
                <Link key={inv.id} to={`/invoices/${inv.id}`} className="card p-5 group active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-primary-950/40 rounded-xl flex items-center justify-center border border-primary-500/10">
                      <FileText size={18} className="text-primary-400" />
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-bold text-white truncate group-hover:text-primary-400 transition-colors">
                      {inv.supplier_name || inv.original_filename}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono uppercase">
                      <span>{inv.invoice_number || 'No #'}</span>
                      <span className="text-slate-800">•</span>
                      <span>{formatDate(inv.invoice_date)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-white/5">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Payable</p>
                      <p className="text-sm font-black text-white">{formatCurrency(inv.total_amount)}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-primary-500/20 text-slate-500 group-hover:text-primary-400 transition-colors">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-700 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages} 
              className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-700 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
