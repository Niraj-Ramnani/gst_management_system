import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, IndianRupee, TrendingUp, Shield, Upload, ArrowRight, Clock, Download } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import KpiCard from '../components/ui/KpiCard'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { invoiceService, reportService } from '../services/api'
import { formatCurrency, formatDate, getMonthName } from '../utils/formatters'

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
    <div className="card-glass px-4 py-3 text-sm shadow-xl">
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [invoiceSummary, setInvoiceSummary] = useState(null)
  const [taxSummary, setTaxSummary] = useState(null)
  const [recentInvoices, setRecentInvoices] = useState([])
  const [profileMissing, setProfileMissing] = useState(false)

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

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>

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

      {/* Header */}
      <motion.div variants={itemVariants} className="page-header !mb-4 sm:!mb-6">
        <div>
          <h1 className="section-title text-xl sm:text-2xl">Operations Dashboard</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Real-time GST compliance and invoice tracking</p>
        </div>
        <Link 
          to="/upload" 
          className={clsx(
            "btn-primary w-full sm:w-auto flex items-center gap-2 group",
            profileMissing && "opacity-50 pointer-events-none cursor-not-allowed"
          )}
        >
          <Upload size={16} className="group-hover:-translate-y-0.5 transition-transform" /> 
          Upload New Invoice
        </Link>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Total Invoices"
          value={invoiceSummary?.total || 0}
          icon={FileText}
          color="primary"
          subtitle={`${invoiceSummary?.verified || 0} verified`}
        />
        <KpiCard
          title="Net GST Payable"
          value={formatCurrency(taxSummary?.total_net_gst_payable)}
          icon={IndianRupee}
          color="success"
          subtitle="Tax Liability"
        />
        <KpiCard
          title="Input Tax Credit"
          value={formatCurrency(taxSummary?.total_input_tax_credit)}
          icon={Shield}
          color="purple"
          subtitle="Available Credit"
        />
        <div className="card p-4 flex flex-col justify-between bg-primary-600/5 border-primary-500/20 border relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary-500/10 blur-2xl rounded-full group-hover:bg-primary-500/20 transition-all" />
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">System Status</span>
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
           </div>
           <p className="text-2xl font-bold text-white font-tabular">99.8<span className="text-xs text-slate-500 ml-1">%</span></p>
           <p className="text-[10px] text-slate-500 font-bold">Extraction Accuracy</p>
        </div>
      </motion.div>

      {/* Charts & Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Monthly Tax Trend */}
        <motion.div variants={itemVariants} className="card p-5 sm:p-6 lg:col-span-8 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-title text-base sm:text-lg">Revenue & Tax Analytics</h3>
            <Link to="/reports" className="text-[10px] font-black uppercase tracking-widest text-primary-400 hover:text-primary-300 flex items-center gap-1 group/link">
              Detailed Reports <ArrowRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {chartData.length > 0 ? (
            <div className="h-[240px]">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
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
          <motion.div variants={itemVariants} className="card p-5 sm:p-6">
            <h3 className="section-title text-base mb-6">Compliance Status</h3>
            <div className="space-y-4">
              {invoiceSummary?.by_status && Object.entries(invoiceSummary.by_status).map(([status, count]) => {
                const total = invoiceSummary.total || 1
                const pct = Math.round((count / total) * 100)
                const colorMap = {
                  verified: 'bg-gradient-to-r from-success-500 to-green-400', 
                  parsed: 'bg-gradient-to-r from-primary-500 to-cyan-400',
                  uploaded: 'bg-slate-600',
                  included_in_return: 'bg-gradient-to-r from-purple-500 to-pink-500',
                }
                return (
                  <div key={status} className="group/bar">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
                      <span className="text-slate-500 group-hover/bar:text-slate-300 transition-colors capitalize">{status.replace(/_/g, ' ')}</span>
                      <span className="text-slate-400">{count}</span>
                    </div>
                    <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${colorMap[status] || 'bg-slate-700'}`} 
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* New Quick Stats Card */}
          <motion.div variants={itemVariants} className="card p-5 bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/10">
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
        <motion.div variants={itemVariants} className="card overflow-hidden lg:col-span-8">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-white/[0.01]">
            <h3 className="section-title text-base">Recently Processed</h3>
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
              <div className="px-5 py-12 text-center text-slate-500 text-sm italic">
                No recent activity. <Link to="/upload" className="font-bold text-primary-400 hover:underline">Start scanning.</Link>
              </div>
            ) : recentInvoices.map(inv => (
              <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors relative group">
                <div className="w-10 h-10 bg-primary-950/40 rounded-xl flex items-center justify-center shrink-0 border border-primary-500/10 group-hover:scale-105 transition-transform">
                  <FileText size={18} className="text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-100 truncate mb-0.5">
                    {inv.supplier_name || inv.original_filename}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                     <span>{formatDate(inv.created_at)}</span>
                     <span className="text-slate-800">•</span>
                     <span className="truncate">#{inv.invoice_number || 'N/A'}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-white mb-1.5">{formatCurrency(inv.total_amount)}</p>
                  <StatusBadge status={inv.status} />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={itemVariants} className="lg:col-span-4 grid grid-cols-1 gap-4">
          {[
            { to: '/upload', icon: Upload, label: 'Upload Invoice', desc: 'Scan PDFs for extraction', color: 'text-primary-400 bg-primary-950/20' },
            { to: '/reports', icon: TrendingUp, label: 'Annual Analytics', desc: 'Yearly GST performance', color: 'text-success-400 bg-success-950/20' },
            { to: '/forecast', icon: TrendingUp, label: 'Tax Projection', desc: 'Predict future liabilities', color: 'text-purple-400 bg-purple-950/20' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to} className={`card p-5 flex items-center gap-5 hover:translate-x-1 group transition-all border border-slate-800/50`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} border border-white/5`}>
                <Icon size={20} className="group-hover:rotate-12 transition-transform" />
              </div>
              <div className="flex-1">
                <span className="block text-[11px] font-black uppercase tracking-widest text-slate-100 mb-0.5">{label}</span>
                <span className="block text-[9px] text-slate-500 font-medium">{desc}</span>
              </div>
              <ArrowRight size={14} className="text-slate-700 group-hover:text-white transition-colors" />
            </Link>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
