import { useState, useEffect } from 'react'
import { BarChart2, IndianRupee, FileText, Download, Play, RefreshCw } from 'lucide-react'
import { returnsService, reportService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatCurrency, MONTHS } from '../utils/formatters'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import clsx from 'clsx'

export default function ReportsPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [summary, setSummary] = useState(null)
  const [taxData, setTaxData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => { loadReports() }, [month, year])

  const loadReports = async () => {
    setLoading(true)
    try {
      const [taxRes] = await Promise.allSettled([
        reportService.taxSummary({ month, year }),
      ])
      if (taxRes.status === 'fulfilled') setTaxData(taxRes.value.data)
    } finally { setLoading(false) }
  }

  const handleGenerateReturn = async () => {
    setGenerating(true)
    try {
      const { data } = await returnsService.generate(month, year)
      setSummary(data)
      toast.success('GST return generated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate return')
    } finally { setGenerating(false) }
  }

  const barData = (taxData?.monthly || []).slice(-6).map(m => ({
    name: `${MONTHS.find(x => x.value === m.month)?.label?.slice(0, 3)} '${String(m.year).slice(2)}`,
    'Sales Tax': m.total_sales_tax,
    'Purchase Tax': m.total_purchase_tax,
    'Net Payable': m.net_gst_payable,
  }))

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Reports & Returns</h1>
          <p className="text-slate-400 text-sm mt-0.5">Generate GST summaries and return filings</p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="card p-6">
        <h3 className="font-semibold text-white mb-4">Select Filing Period</h3>
        <div className="flex gap-4 flex-wrap items-end">
          <div>
            <label className="label">Month</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input text-sm w-44">
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="input text-sm w-32">
              {[2022, 2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={handleGenerateReturn} disabled={generating} className="btn-primary flex items-center gap-2">
            {generating ? <><RefreshCw size={16} className="animate-spin" /> Generating…</> : <><Play size={16} /> Generate Return</>}
          </button>
        </div>
      </div>

      {/* Generated Return Summary */}
      {summary && (
        <div className="card p-6 border-success-800/50 bg-success-900/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FileText size={16} className="text-success-400" />
              GSTR Summary — {MONTHS.find(m => m.value === summary.month)?.label} {summary.year}
            </h3>
            <button className="btn-ghost flex items-center gap-2 text-sm">
              <Download size={14} /> Export PDF
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Invoices', value: summary.total_invoices, mono: false },
              { label: 'Taxable Value', value: formatCurrency(summary.total_taxable_value), mono: true },
              { label: 'Sales Tax (Output)', value: formatCurrency(summary.total_sales_tax), mono: true },
              { label: 'Purchase Tax (ITC)', value: formatCurrency(summary.input_tax_credit), mono: true },
            ].map(({ label, value, mono }) => (
              <div key={label} className="bg-surface-950 rounded-xl p-4 border border-slate-800">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className={clsx('text-lg font-bold text-white', mono && 'font-mono')}>{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-primary-900/20 border border-primary-800/40 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-300 font-medium">Net GST Payable</p>
              <p className="text-xs text-primary-500 mt-0.5">Output Tax − Input Tax Credit</p>
            </div>
            <p className="text-3xl font-display font-bold text-primary-400">{formatCurrency(summary.net_gst_payable)}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            {[
              ['CGST Payable', summary.cgst_payable],
              ['SGST Payable', summary.sgst_payable],
              ['IGST Payable', summary.igst_payable],
            ].map(([label, val]) => (
              <div key={label} className="bg-surface-950 rounded-lg p-3 border border-slate-800">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="font-semibold text-white font-mono mt-0.5">{formatCurrency(val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Tax Chart */}
      {barData.length > 0 && (
        <div className="card p-6">
          <h3 className="section-title mb-6">Tax History (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} stroke="#475569" />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} stroke="#475569" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={v => formatCurrency(v)}
              />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
              <Bar dataKey="Sales Tax" fill="#0ea5e9" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Purchase Tax" fill="#6366f1" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Net Payable" fill="#22c55e" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Totals overview */}
      {taxData && (
        <div className="card p-6">
          <h3 className="section-title mb-4">All-time Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Sales Tax', value: formatCurrency(taxData.total_sales_tax) },
              { label: 'Total Purchase Tax', value: formatCurrency(taxData.total_purchase_tax) },
              { label: 'Total ITC', value: formatCurrency(taxData.total_input_tax_credit) },
              { label: 'Net GST Paid', value: formatCurrency(taxData.total_net_gst_payable) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-950 rounded-xl p-4 border border-slate-800">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className="text-lg font-bold text-white font-mono">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
