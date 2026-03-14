import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FileText, Search, Filter, Upload, ChevronLeft, ChevronRight, ArrowRight, Download } from 'lucide-react'
import { invoiceService } from '../services/api'
import StatusBadge from '../components/ui/StatusBadge'
import { TableSkeleton } from '../components/ui/Skeleton'
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

  const handleExport = async () => {
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.invoice_type = typeFilter
      
      const response = await invoiceService.exportExcel(params)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoices_export_${new Date().getTime()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  useEffect(() => { loadInvoices() }, [loadInvoices])

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in">
      {/* Header */}
      <div className="page-header !mb-6 sm:!mb-10">
        <div>
          <h1 className="section-title text-xl sm:text-3xl">Invoice Repository</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">{total} processed documents</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={handleExport}
            className="btn-secondary flex items-center justify-center gap-2 group"
          >
            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> Export Excel
          </button>
          <Link to="/upload" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group">
            <Upload size={16} className="group-hover:-translate-y-0.5 transition-transform" /> Scan New
          </Link>
        </div>
      </div>

      {/* Filters Overlay */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl backdrop-blur-md">
        <div className="flex gap-3 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar w-full sm:w-auto">
          <div className="relative shrink-0">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              className="input pl-9 pr-10 py-2.5 text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer min-w-[170px] bg-slate-900/60 border-white/5 focus:border-primary-500/50"
            >
              {STATUSES.map(s => <option key={s} value={s} className="bg-slate-900">{s ? s.replace(/_/g, ' ') : 'All statuses'}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
               <ArrowRight size={12} className="rotate-90" />
            </div>
          </div>
          <div className="relative shrink-0">
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
              className="input px-4 pr-10 py-2.5 text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer min-w-[140px] bg-slate-900/60 border-white/5 focus:border-primary-500/50"
            >
              {TYPES.map(t => <option key={t} value={t} className="bg-slate-900">{t ? `${t}s` : 'All Types'}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
               <ArrowRight size={12} className="rotate-90" />
            </div>
          </div>
        </div>
        <div className="hidden sm:block h-6 w-px bg-white/5 mx-2" />
        <div className="relative flex-1 w-full max-w-sm">
           <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
           <input 
              type="text" 
              placeholder="QUICK SEARCH SUPPLIER OR GSTIN..." 
              className="w-full bg-slate-950/40 border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-[10px] font-bold tracking-widest text-slate-300 placeholder:text-slate-600 focus:border-primary-500/30 outline-none transition-all uppercase"
           />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="card p-8">
            <TableSkeleton rows={7} />
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
            <div className="hidden lg:block card overflow-hidden !p-0 border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-900/40 backdrop-blur-lg">
                      {['Invoice #', 'Entity Details', 'Date', 'Taxable', 'GST Ledger', 'Gross Total', 'Status', ''].map(h => (
                        <th key={h} className="text-left px-6 py-5 text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {invoices.map(inv => (
                      <tr 
                        key={inv.id} 
                        className="hover:bg-primary-500/[0.03] border-l-2 border-l-transparent hover:border-l-primary-500/40 transition-all duration-200 group cursor-pointer" 
                        onClick={() => navigate(`/invoices/${inv.id}`)}
                      >
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary-500 transition-colors" />
                              <span className="font-mono text-xs text-slate-400 font-bold">{inv.invoice_number || 'TRX-XXXX'}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-slate-100 font-black text-sm truncate max-w-[200px] mb-0.5 group-hover:text-primary-400 transition-colors">{inv.supplier_name || inv.original_filename}</p>
                            {inv.supplier_gstin && <p className="text-[10px] text-slate-600 font-mono tracking-tighter uppercase">{inv.supplier_gstin}</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-slate-400 text-[11px] font-bold">{formatDate(inv.invoice_date)}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-slate-300 font-bold text-xs font-tabular">{formatCurrency(inv.taxable_amount)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 font-tabular">
                             {inv.cgst > 0 && <span className="text-[8px] px-1.5 py-0.5 bg-slate-900 border border-white/5 rounded font-bold text-slate-500">C:{formatCurrency(inv.cgst)}</span>}
                             {inv.sgst > 0 && <span className="text-[8px] px-1.5 py-0.5 bg-slate-900 border border-white/5 rounded font-bold text-slate-500">S:{formatCurrency(inv.sgst)}</span>}
                             {inv.igst > 0 && <span className="text-[8px] px-1.5 py-0.5 bg-slate-900 border border-white/5 rounded font-bold text-slate-500">I:{formatCurrency(inv.igst)}</span>}
                             {!inv.cgst && !inv.sgst && !inv.igst && <span className="text-[8px] text-slate-700 italic">No tax entry</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-sm font-bold text-white font-tabular">{formatCurrency(inv.total_amount)}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="scale-90 origin-left">
                              <StatusBadge status={inv.status} />
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-all">
                             <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </div>
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
                      <p className="text-sm font-bold text-white font-tabular">{formatCurrency(inv.total_amount)}</p>
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
