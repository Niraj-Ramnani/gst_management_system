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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 !mb-8 sm:!mb-12">
        <div className="pl-4 border-l-4 border-[#2563eb]">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: theme === 'light' ? '#0f172a' : '#ffffff' }}>Invoice Repository</h1>
          <div className="flex items-center gap-2 mt-2 text-slate-500">
            <FileText size={14} />
            <span className="text-xs sm:text-sm font-medium">{total.toLocaleString()} processed documents</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={handleExport}
            className={clsx(
              "flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border",
              theme === 'light' 
                ? "bg-white border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc] shadow-sm" 
                : "bg-transparent border-white/10 text-[#e2e8f0] hover:bg-white/5"
            )}
          >
            <Download size={16} /> Export Excel
          </button>
          <Link 
            to="/upload" 
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all duration-300"
          >
            <Upload size={16} /> Scan New
          </Link>
        </div>
      </div>

      {/* Filters Overlay */}
      <div 
        className={clsx(
          "flex flex-col md:flex-row items-center gap-3 p-4 rounded-2xl transition-all duration-300",
          theme === 'light' ? "bg-white shadow-sm border border-[#e2e8f0]" : "bg-white/[0.02] border border-white/[0.05] backdrop-blur-md"
        )}
      >
        <div className="flex flex-1 gap-3 w-full">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by supplier name, invoice # or GSTIN..." 
              className={clsx(
                "w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border",
                theme === 'light' 
                  ? "bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]" 
                  : "bg-slate-950/40 border-white/5 text-slate-300 placeholder-slate-600 focus:border-primary-500/50"
              )}
            />
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-[180px]">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              className={clsx(
                "w-full pl-4 pr-10 py-3 rounded-xl text-sm font-semibold appearance-none cursor-pointer outline-none transition-all border",
                theme === 'light' 
                  ? "bg-white border-[#e2e8f0] text-[#374151] focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]" 
                  : "bg-[#0d1424] border-white/5 text-slate-300 focus:border-primary-500/50"
              )}
            >
              {STATUSES.map(s => (
                <option key={s} value={s} className={theme === 'light' ? 'bg-white' : 'bg-[#0d1424]'}>
                  {s ? s.replace(/_/g, ' ').toUpperCase() : 'All Statuses'}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <ArrowRight size={14} className="rotate-90" />
            </div>
          </div>

          <div className="relative flex-1 md:w-[150px]">
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
              className={clsx(
                "w-full pl-4 pr-10 py-3 rounded-xl text-sm font-semibold appearance-none cursor-pointer outline-none transition-all border",
                theme === 'light' 
                  ? "bg-white border-[#e2e8f0] text-[#374151] focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]" 
                  : "bg-[#0d1424] border-white/5 text-slate-300 focus:border-primary-500/50"
              )}
            >
              {TYPES.map(t => (
                <option key={t} value={t} className={theme === 'light' ? 'bg-white' : 'bg-[#0d1424]'}>
                  {t ? t.toUpperCase() + 'S' : 'All Types'}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <ArrowRight size={14} className="rotate-90" />
            </div>
          </div>
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
            <div 
              className={clsx(
                "hidden lg:block rounded-2xl border transition-all duration-300 overflow-hidden",
                theme === 'light' ? "bg-white border-[#e2e8f0] shadow-sm" : "bg-[#0a0f1e] border-white/5"
              )}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className={clsx(
                      "transition-colors",
                      theme === 'light' ? "bg-[#f1f5f9]" : "bg-[#080d1a]"
                    )}>
                      {['Invoice #', 'Entity Details', 'Date', 'Taxable', 'GST Ledger', 'Gross Total', 'Status', ''].map(h => (
                        <th 
                          key={h} 
                          className="text-left px-6 py-4 text-[#64748b] font-black text-[11px] uppercase tracking-widest whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={clsx(
                    "divide-y transition-colors",
                    theme === 'light' ? "divide-[#f1f5f9]" : "divide-white/[0.05]"
                  )}>
                    {invoices.map(inv => (
                      <tr 
                        key={inv.id} 
                        className={clsx(
                          "transition-all duration-150 group cursor-pointer",
                          theme === 'light' ? "hover:bg-[#f8fafc]" : "hover:bg-[rgba(0,180,245,0.04)]"
                        )}
                        onClick={() => navigate(`/invoices/${inv.id}`)}
                      >
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-3">
                              <div className={clsx(
                                "w-1.5 h-1.5 rounded-full transition-colors",
                                inv.status === 'flagged' ? 'bg-red-500' :
                                inv.status === 'verified' ? 'bg-green-500' :
                                inv.status === 'parsed' ? 'bg-blue-500' : 'bg-slate-400'
                              )} />
                              <span className="font-mono text-xs text-slate-500 font-bold">{inv.invoice_number || 'TRX-XXXX'}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            <p className={clsx(
                              "font-bold text-sm truncate max-w-[200px] mb-0.5 transition-colors",
                              theme === 'light' ? 'text-[#0f172a] group-hover:text-[#2563eb]' : 'text-white group-hover:text-primary-400'
                            )}>
                              {inv.supplier_name || inv.original_filename}
                            </p>
                            {inv.supplier_gstin && (
                              <p className="text-[12px] text-[#94a3b8] font-mono tracking-tight uppercase">
                                {inv.supplier_gstin}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className="text-slate-500 text-xs font-semibold">{formatDate(inv.invoice_date)}</span>
                        </td>
                        <td className="px-6 py-5">
                           <span className={clsx(
                             "font-bold text-xs font-tabular",
                             theme === 'light' ? 'text-[#0f172a]' : 'text-[#e2e8f0]'
                           )}>
                             {formatCurrency(inv.taxable_amount)}
                           </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1.5 font-tabular">
                             {inv.cgst > 0 && (
                               <span className="text-[10px] px-2 py-0.5 bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] rounded font-bold">
                                 C:{formatCurrency(inv.cgst)}
                               </span>
                             )}
                             {inv.sgst > 0 && (
                               <span className="text-[10px] px-2 py-0.5 bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe] rounded font-bold">
                                 S:{formatCurrency(inv.sgst)}
                               </span>
                             )}
                             {inv.igst > 0 && (
                               <span className="text-[10px] px-2 py-0.5 bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] rounded font-bold">
                                 I:{formatCurrency(inv.igst)}
                               </span>
                             )}
                             {!inv.cgst && !inv.sgst && !inv.igst && (
                               <span className="text-[10px] text-slate-400 italic">No tax entry</span>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className={clsx(
                             "font-bold text-sm font-tabular",
                             theme === 'light' ? 'text-[#0f172a]' : 'text-white'
                           )}>
                             {formatCurrency(inv.total_amount)}
                           </span>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex">
                              <span className={clsx(
                                "px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap",
                                inv.status === 'parsed' ? 'bg-[#eff6ff] text-[#2563eb]' :
                                inv.status === 'verified' ? 'bg-[#f0fdf4] text-[#16a34a]' :
                                inv.status === 'flagged' ? 'bg-[#fef2f2] text-[#dc2626]' :
                                'bg-[#f8fafc] text-[#64748b]'
                              )}>
                                {inv.status ? inv.status.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN'}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all",
                            theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-primary-500/20 text-primary-400'
                          )}>
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
                <div 
                  key={inv.id} 
                  className={clsx(
                    "rounded-2xl p-5 transition-all duration-300 transform active:scale-[0.98] border cursor-pointer",
                    theme === 'light' ? "bg-white border-[#e2e8f0] shadow-sm" : "bg-[#0d1424] border-white/5"
                  )}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-2 h-2 rounded-full",
                        inv.status === 'flagged' ? 'bg-red-500' :
                        inv.status === 'verified' ? 'bg-green-500' :
                        inv.status === 'parsed' ? 'bg-blue-500' : 'bg-slate-400'
                      )} />
                      <span className="font-mono text-xs text-slate-500 font-bold">{inv.invoice_number || 'No #'}</span>
                    </div>
                    <span className={clsx(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap",
                      inv.status === 'parsed' ? 'bg-[#eff6ff] text-[#2563eb]' :
                      inv.status === 'verified' ? 'bg-[#f0fdf4] text-[#16a34a]' :
                      inv.status === 'flagged' ? 'bg-[#fef2f2] text-[#dc2626]' :
                      'bg-[#f8fafc] text-[#64748b]'
                    )}>
                      {inv.status ? inv.status.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className={clsx(
                      "text-sm font-bold truncate transition-colors",
                      theme === 'light' ? 'text-[#0f172a]' : 'text-white'
                    )}>
                      {inv.supplier_name || inv.original_filename}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
                       <span>{formatDate(inv.invoice_date)}</span>
                       <span className="opacity-20">|</span>
                       <span className="uppercase text-[9px] font-black tracking-widest">{inv.invoice_type || 'transaction'}</span>
                    </div>
                  </div>
                  <div className={clsx(
                    "flex justify-between items-end pt-4 border-t",
                    theme === 'light' ? "border-[#f1f5f9]" : "border-white/5"
                  )}>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Payable</p>
                      <p className={clsx(
                        "text-lg font-bold font-tabular",
                        theme === 'light' ? 'text-[#0f172a]' : 'text-white'
                      )}>
                        {formatCurrency(inv.total_amount)}
                      </p>
                    </div>
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-primary-500/20 text-primary-400'
                    )}>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={clsx(
          "flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t transition-colors duration-300",
          theme === 'light' ? "border-[#e2e8f0]" : "border-white/5"
        )}>
          <p className="text-xs font-medium text-slate-500 order-2 sm:order-1">
            Showing <span className="font-bold text-inherit">{invoices.length}</span> of <span className="font-bold text-inherit">{total}</span> records
          </p>
          <div className="flex items-center gap-3 order-1 sm:order-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border disabled:opacity-30 disabled:cursor-not-allowed",
                theme === 'light' 
                  ? "bg-white border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc]" 
                  : "bg-slate-900 border-white/10 text-slate-400 hover:border-slate-700"
              )}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <div className="flex gap-1.5">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={clsx(
                    "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all",
                    page === i + 1 
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" 
                      : (theme === 'light' ? "text-[#64748b] hover:bg-[#f1f5f9]" : "text-slate-500 hover:bg-white/5")
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages} 
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border disabled:opacity-30 disabled:cursor-not-allowed",
                theme === 'light' 
                  ? "bg-white border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc]" 
                  : "bg-slate-900 border-white/10 text-slate-400 hover:border-slate-700"
              )}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
