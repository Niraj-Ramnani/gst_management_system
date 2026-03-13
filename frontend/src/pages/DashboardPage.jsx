import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, IndianRupee, TrendingUp, Shield, Upload, ArrowRight, Clock } from 'lucide-react'
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
  const [chartData, setChartData] = useState([])

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
      }
      if (recentRes.status === 'fulfilled') setRecentInvoices(recentRes.value.data.invoices || [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="page-header">
        <div>
          <h1 className="section-title">Operations Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time GST compliance and invoice tracking</p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2 group">
          <Upload size={16} className="group-hover:-translate-y-0.5 transition-transform" /> 
          Upload New Invoice
        </Link>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          title="Total Invoices"
          value={invoiceSummary?.total || 0}
          icon={FileText}
          color="primary"
          subtitle={`${invoiceSummary?.verified || 0} verified documents`}
        />
        <KpiCard
          title="Net GST Payable"
          value={formatCurrency(taxSummary?.total_net_gst_payable)}
          icon={IndianRupee}
          color="success"
          subtitle="Reflects ITC deductions"
        />
        <KpiCard
          title="Input Tax Credit"
          value={formatCurrency(taxSummary?.total_input_tax_credit)}
          icon={Shield}
          color="purple"
          subtitle="Available for offset"
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Tax Trend */}
        <motion.div variants={itemVariants} className="card p-8 lg:col-span-2 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="section-title text-xl">Revenue & Tax Analytics</h3>
            <Link to="/reports" className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1 group/link">
              Detailed Reports <ArrowRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Sales Tax" stroke="#0ea5e9" fill="url(#salesGrad)" strokeWidth={3} animationDuration={1500} />
                <Area type="monotone" dataKey="Net Payable" stroke="#22c55e" fill="url(#netGrad)" strokeWidth={3} animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-56 text-slate-500 text-sm">
              Insufficient data for analytics trend.
            </div>
          )}
        </motion.div>

        {/* Invoice Status Breakdown */}
        <motion.div variants={itemVariants} className="card p-8">
          <h3 className="section-title text-xl mb-8">Compliance Status</h3>
          <div className="space-y-6">
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
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="text-slate-500 group-hover/bar:text-slate-300 transition-colors capitalize">{status.replace(/_/g, ' ')}</span>
                    <span className="text-slate-400">{count} units ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden p-[1px]">
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
          <Link to="/invoices" className="mt-8 flex items-center justify-center gap-2 py-3 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition-all bg-slate-900/20">
            View All Documentation <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>

      {/* Recent Invoices */}
      <motion.div variants={itemVariants} className="card overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800/60 bg-white/[0.01]">
          <h3 className="section-title text-lg">Recently Processed</h3>
          <Link to="/invoices" className="text-xs font-bold text-primary-400 hover:text-primary-300">
            Export All
          </Link>
        </div>
        <div className="divide-y divide-slate-800/40">
          {recentInvoices.length === 0 ? (
            <div className="px-8 py-16 text-center text-slate-500 text-sm">
              No recent activity. <Link to="/upload" className="text-primary-400 hover:underline">Start scanning.</Link>
            </div>
          ) : recentInvoices.map(inv => (
            <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center gap-4 px-8 py-5 hover:bg-white/[0.02] transition-colors relative group">
              <div className="w-11 h-11 bg-primary-900/20 rounded-2xl flex items-center justify-center shrink-0 border border-primary-500/10 group-hover:scale-105 transition-transform">
                <FileText size={20} className="text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate mb-0.5">
                  {inv.supplier_name || inv.original_filename}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                   <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(inv.created_at)}</span>
                   {inv.invoice_number && <span className="text-slate-700">|</span>}
                   {inv.invoice_number && <span>#{inv.invoice_number}</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-white mb-1.5">{formatCurrency(inv.total_amount)}</p>
                <StatusBadge status={inv.status} />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { to: '/upload', icon: Upload, label: 'Upload Invoice', color: 'text-primary-400 bg-primary-900/20 border-primary-500/20' },
          { to: '/reports', icon: TrendingUp, label: 'Annual Analytics', color: 'text-success-400 bg-success-900/20 border-success-500/20' },
          { to: '/forecast', icon: TrendingUp, label: 'Tax Projection', color: 'text-purple-400 bg-purple-900/20 border-purple-500/20' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to} className={`card p-6 flex flex-col gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group ${color} border`}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-black/20">
              <Icon size={22} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wide text-slate-100">{label}</span>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  )
}
