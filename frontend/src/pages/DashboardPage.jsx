import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, IndianRupee, TrendingUp, Shield, Upload, ArrowRight, Clock, Download, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from '../context/ThemeContext'
import KpiCard from '../components/ui/KpiCard'
import StatusBadge from '../components/ui/StatusBadge'
import { KpiSkeleton } from '../components/ui/Skeleton'
import { invoiceService, reportService } from '../services/api'
import { formatCurrency, formatDate, getMonthName } from '../utils/formatters'
import clsx from 'clsx'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 shadow-2xl">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2.5 mb-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-xs text-slate-400">{p.name}:</span>
          <span className="text-xs font-bold text-white ml-auto">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [invoiceSummary, setInvoiceSummary] = useState(null)
  const [taxSummary, setTaxSummary] = useState(null)
  const [recentInvoices, setRecentInvoices] = useState([])
  const [chartData, setChartData] = useState([])
  const [profileMissing, setProfileMissing] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [invRes, taxRes, recentRes] = await Promise.allSettled([
        reportService.invoiceSummary({}),
        reportService.taxSummary({}),
        invoiceService.list({ page: 1, page_size: 5 }),
      ])

      if (invRes.status === 'fulfilled') setInvoiceSummary(invRes.value.data)
      if (taxRes.status === 'fulfilled') {
        setTaxSummary(taxRes.value.data)
        const monthly = taxRes.value.data?.monthly || []
        setChartData(monthly.slice(-6).map(m => ({
          name: `${getMonthName(m.month)} '${String(m.year).slice(2)}`,
          'Sales Tax': m.total_sales_tax,
          'Purchase Tax': m.total_purchase_tax,
          'Net Payable': m.net_gst_payable,
        })))
      } else if (taxRes.reason?.response?.status === 400) {
        setProfileMissing(true)
      }
      
      if (recentRes.status === 'fulfilled') setRecentInvoices(recentRes.value.data.invoices || [])
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await invoiceService.exportExcel({})
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoices_export_full_${new Date().getTime()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 card p-6 h-64 skeleton" />
        <div className="lg:col-span-4 card p-6 h-64 skeleton" />
      </div>
    </div>
  )

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Onboarding Banner */}
      {profileMissing && (
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 sm:p-8 shadow-xl shadow-primary-900/20 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 blur-3xl -mr-20 -mt-20 opacity-50" />
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 shrink-0">
             <Shield size={28} className="text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2 relative">
             <h2 className="text-xl font-black text-white uppercase tracking-tight">Complete Your Setup</h2>
             <p className="text-white/80 text-sm">Please create your business profile and GSTIN details to enable invoice scanning and tax analytics.</p>
          </div>
          <Link to="/profile" className="btn-secondary !bg-white !text-primary-600 px-8 py-3 font-black text-xs uppercase tracking-widest relative z-10 shrink-0">
             Setup Profile
          </Link>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-8">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${theme === 'light' ? 'text-[#0f172a]' : 'text-white'}`}>Operations Dashboard</h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${theme === 'light' ? 'text-[#475569]' : 'text-slate-400'}`}>Real-time GST compliance and invoice tracking</p>
        </div>
        <Link 
          to="/upload" 
          className={clsx(
            "h-[52px] px-6 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(0,180,245,0.3)] bg-gradient-to-r from-[#2563eb] to-[#00b4f5] border-none group",
            profileMissing && "opacity-50 pointer-events-none cursor-not-allowed"
          )}
        >
          <Upload size={18} className="group-hover:scale-110 transition-transform" /> 
          Upload New Invoice
        </Link>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Invoices"
          value={new Intl.NumberFormat('en-IN').format(invoiceSummary?.total || 0)}
          icon={FileText}
          color="primary"
          trend="up"
          trendValue="+14%"
        />
        <KpiCard
          title="Net GST Payable"
          value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(taxSummary?.total_net_gst_payable || 0)}
          icon={IndianRupee}
          color="success"
          trend="up"
          trendValue="+8.5%"
        />
        <KpiCard
          title="Input Tax Credit"
          value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(taxSummary?.total_input_tax_credit || 0)}
          icon={Shield}
          color="purple"
          trend="up"
          trendValue="+21%"
        />
        <KpiCard
          title="System Status"
          value="99.8%"
          icon={Activity}
          color="cyan"
          trend="up"
          trendValue="+0.2%"
        />
      </motion.div>

      {/* Charts & Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Monthly Tax Trend */}
        <motion.div 
          variants={itemVariants} 
          className="p-6 sm:p-8 rounded-[24px] lg:col-span-8 relative overflow-hidden group transition-all duration-300 border"
          style={{ 
            backgroundColor: theme === 'light' ? '#ffffff' : '#0d1424',
            borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(0,180,245,0.15)',
            boxShadow: theme === 'light' ? '0 2px 16px rgba(0,0,0,0.06)' : 'none'
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h3 className={`text-xl font-black tracking-tight mb-1 ${theme === 'light' ? 'text-[#0f172a]' : 'text-white'}`}>Revenue & Tax Analytics</h3>
              <p className={`text-sm font-medium ${theme === 'light' ? 'text-[#475569]' : 'text-slate-400'}`}>Monthly overview of your GST liabilities and credits</p>
            </div>
            <div className="flex items-center gap-2 p-1 rounded-full border" style={{ backgroundColor: theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.03)', borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.05)' }}>
              {['3M', '6M', '1Y'].map(period => (
                <button key={period} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${period === '6M' ? (theme === 'light' ? 'bg-white text-[#2563eb] shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : 'bg-[#00b4f5]/20 text-[#00b4f5]') : (theme === 'light' ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-slate-400 hover:text-white')}`}>
                  {period}
                </button>
              ))}
            </div>
          </div>
          {chartData.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e2e8f0' : '#1e293b'} vertical={false} />
                  <XAxis dataKey="name" stroke={theme === 'light' ? '#94a3b8' : '#475569'} tick={{ fill: theme === 'light' ? '#64748b' : '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis stroke={theme === 'light' ? '#94a3b8' : '#475569'} tick={{ fill: theme === 'light' ? '#64748b' : '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Sales Tax" stroke="#0ea5e9" fill="url(#salesGrad)" strokeWidth={3} animationDuration={1500} />
                  <Area type="monotone" dataKey="Net Payable" stroke="#22c55e" fill="url(#netGrad)" strokeWidth={3} animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 sm:h-56 text-slate-500 text-sm italic">
              Insufficient data for analytics trend.
            </div>
          )}
        </motion.div>

        {/* Info Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Invoice Status Breakdown */}
          <motion.div 
            variants={itemVariants} 
            className="p-6 sm:p-8 rounded-[24px] transition-all duration-300 border"
            style={{ 
              backgroundColor: theme === 'light' ? '#ffffff' : '#0d1424',
              borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(0,180,245,0.15)',
              boxShadow: theme === 'light' ? '0 2px 16px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <h3 className={`text-lg font-black tracking-tight mb-6 ${theme === 'light' ? 'text-[#0f172a]' : 'text-white'}`}>Compliance Status</h3>
            <div className="space-y-5">
              {invoiceSummary?.by_status && Object.entries(invoiceSummary.by_status).map(([status, count]) => {
                const total = invoiceSummary.total || 1
                const pct = Math.round((count / total) * 100)
                const statusMap = {
                  verified: { label: 'Verified', color: 'bg-[#22c55e]' },
                  included_in_return: { label: 'Filed in Return', color: 'bg-[#2563eb]' },
                  flagged: { label: 'Fraud Flagged', color: 'bg-[#ef4444]' },
                  parsed: { label: 'AI Processed', color: 'bg-[#00b4f5]' },
                  uploaded: { label: 'Pending Review', color: 'bg-[#94a3b8]' },
                }
                const display = statusMap[status] || { label: status, color: 'bg-[#94a3b8]' }
                return (
                  <div key={status} className="group/bar">
                    <div className="flex justify-between text-xs font-bold mb-2 transition-colors duration-300" style={{ color: theme === 'light' ? '#475569' : '#94a3b8' }}>
                      <span>{display.label}</span>
                      <span style={{ color: theme === 'light' ? '#0f172a' : '#ffffff' }}>{count}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${display.color}`} 
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* New Quick Stats Card */}
          <motion.div variants={itemVariants} className="card p-6 bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/10">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                   <Clock size={16} className="text-indigo-400" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Quick Reminders</h4>
             </div>
             <div className="space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                   <div className="w-1 h-1 rounded-full bg-indigo-500" />
                   GSTR-1 Filing due in 3 days
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                   <div className="w-1 h-1 rounded-full bg-indigo-500" />
                   {invoiceSummary?.by_status?.parsed || 0} Invoices pending verification
                </div>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Invoices & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Invoices */}
        <motion.div 
          variants={itemVariants} 
          className="rounded-[24px] overflow-hidden lg:col-span-8 transition-all duration-300 border"
          style={{ 
            backgroundColor: theme === 'light' ? '#ffffff' : '#0d1424',
            borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(0,180,245,0.15)',
            boxShadow: theme === 'light' ? '0 2px 16px rgba(0,0,0,0.06)' : 'none'
          }}
        >
          <div className="flex items-center justify-between px-6 sm:px-8 py-6 border-b" style={{ borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.05)' }}>
            <h3 className={`text-lg font-black tracking-tight ${theme === 'light' ? 'text-[#0f172a]' : 'text-white'}`}>Recently Processed</h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleExport}
                className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Download size={12} /> Export All
              </button>
              <Link to="/invoices" className="text-[9px] font-black uppercase tracking-widest text-primary-400 hover:text-primary-300">
                View Repository
              </Link>
            </div>
          </div>
          <div className="divide-y divide-slate-800/20 max-h-[400px] overflow-y-auto custom-scrollbar">
            {recentInvoices.length === 0 ? (
              <div className="px-5 py-16 text-center text-slate-500 italic flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                  <FileText size={24} className="text-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 mb-1">No recent activity</p>
                  <Link to="/upload" className="text-primary-400 text-xs font-bold hover:text-primary-300">Upload your first invoice →</Link>
                </div>
              </div>
            ) : recentInvoices.map(inv => (
              <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-primary-500/[0.03] border-l-2 border-l-transparent hover:border-l-primary-500/50 transition-all duration-200 group">
                <div className="w-10 h-10 bg-primary-950/40 rounded-xl flex items-center justify-center shrink-0 border border-primary-500/10 group-hover:scale-105 group-hover:border-primary-500/30 transition-all">
                  <FileText size={18} className="text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate mb-0.5 ${theme === 'light' ? 'text-[#0f172a]' : 'text-slate-100'}`}>
                    {inv.supplier_name || inv.original_filename}
                  </p>
                  <div className={`flex items-center gap-2 text-[10px] font-medium ${theme === 'light' ? 'text-[#64748b]' : 'text-slate-500'}`}>
                     <span>{formatDate(inv.created_at)}</span>
                     <span className={theme === 'light' ? 'text-[#cbd5e1]' : 'text-slate-800'}>•</span>
                     <span className="truncate">#{inv.invoice_number || 'N/A'}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-black mb-1.5 ${theme === 'light' ? 'text-[#0f172a]' : 'text-white'}`}>{formatCurrency(inv.total_amount)}</p>
                  <StatusBadge status={inv.status} />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={itemVariants} className="lg:col-span-4 grid grid-cols-1 gap-4">
          {[
            { to: '/upload', icon: Upload, label: 'Upload Invoice', desc: 'Scan PDFs for extraction', border: 'border-[#3b82f6]', bg: 'bg-[rgba(37,99,235,0.1)]', iconColor: '#3b82f6' },
            { to: '/reports', icon: TrendingUp, label: 'Annual Analytics', desc: 'Yearly GST performance', border: 'border-[#22c55e]', bg: 'bg-[rgba(34,197,94,0.1)]', iconColor: '#22c55e' },
            { to: '/forecast', icon: TrendingUp, label: 'Tax Projection', desc: 'Predict future liabilities', border: 'border-[#8b5cf6]', bg: 'bg-[rgba(139,92,246,0.1)]', iconColor: '#8b5cf6' },
          ].map(({ to, icon: Icon, label, desc, border, bg, iconColor }) => (
            <Link 
              key={to} 
              to={to} 
              className="p-6 rounded-[24px] flex items-center gap-4 hover:translate-x-1.5 group transition-all duration-300 border"
              style={{
                backgroundColor: theme === 'light' ? '#ffffff' : '#0d1424',
                borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(0,180,245,0.15)',
                boxShadow: theme === 'light' ? '0 2px 16px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${theme === 'light' ? 'border-transparent bg-slate-50' : 'border-white/5 bg-white/[0.02]'} group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon size={22} color={theme === 'light' ? iconColor : '#00b4f5'} className="group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`block text-xs font-black uppercase tracking-widest mb-1 ${theme === 'light' ? 'text-[#0f172a]' : 'text-slate-100'}`}>{label}</span>
                <span className={`block text-[11px] font-medium truncate ${theme === 'light' ? 'text-[#64748b]' : 'text-slate-500'}`}>{desc}</span>
              </div>
              <ArrowRight size={16} className={`transition-all shrink-0 ${theme === 'light' ? 'text-[#94a3b8] group-hover:text-[#2563eb] group-hover:translate-x-1' : 'text-slate-700 group-hover:text-white group-hover:translate-x-1'}`} />
            </Link>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
