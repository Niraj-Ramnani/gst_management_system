import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Edit3, Check, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { invoiceService } from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { useTheme } from '../context/ThemeContext'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/formatters'
import clsx from 'clsx'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  useEffect(() => { loadInvoice() }, [id])

  const loadInvoice = async () => {
    try {
      const { data } = await invoiceService.get(id)
      setInvoice(data)
      reset(data)
    } catch { toast.error('Invoice not found') }
    finally { setLoading(false) }
  }

  const onSave = async (data) => {
    setSaving(true)
    try {
      const { data: updated } = await invoiceService.review(id, data)
      setInvoice(updated)
      setEditing(false)
      toast.success('Invoice verified and saved')
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const handleReparse = async () => {
    toast.loading('Re-parsing invoice with AI...', { id: 'reparse' })
    try {
      const { data } = await invoiceService.reparse(id)
      setInvoice(data)
      reset(data)
      
      addNotification({
        title: 'Invoice Re-parsed',
        message: `Updated data extracted for ${data.original_filename}`,
        link: `/invoices/${id}`
      })

      toast.success('Invoice data updated successfully!', { id: 'reparse' })
    } catch { 
      toast.error('Reparse failed', { id: 'reparse' }) 
    }
  }



  if (loading) return <LoadingSpinner className="h-64" />

  const Field = ({ label, name, type = 'text', readOnly = false }) => (
    <div>
      <label className="label">{label}</label>
      {editing && !readOnly ? (
        <input {...register(name)} type={type} step="0.01" className="input text-sm" />
      ) : (
        <p className={clsx(
          "text-sm border rounded-xl px-4 py-2.5",
          isLight ? "text-[#0f172a] bg-white border-slate-200" : "text-slate-200 bg-surface-950 border-slate-800"
        )}>
          {type === 'number' ? formatCurrency(invoice?.[name]) : (invoice?.[name] || '—')}
        </p>
      )}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/invoices')} className={clsx("w-10 h-10 flex items-center justify-center border rounded-xl transition-colors", isLight ? "bg-white border-slate-200 text-slate-500 hover:text-[#0f172a] hover:border-slate-300" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white")}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={clsx("section-title text-xl sm:text-2xl", isLight ? "text-[#0f172a]" : "text-white")}>Ledger Entry</h1>
            <p className={clsx("text-[10px] uppercase font-mono tracking-widest mt-0.5", isLight ? "text-slate-400" : "text-slate-500")}>{invoice?.id}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
          <StatusBadge status={invoice?.status} />
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <button 
              onClick={handleReparse} 
              className="flex-1 sm:flex-none btn-secondary !py-2 px-3 flex items-center justify-center gap-2 group" 
              title="Scrub & Reparse"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="sm:hidden lg:inline text-[10px] font-black uppercase tracking-widest">Rescan</span>
            </button>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex-1 sm:flex-none btn-secondary !py-2 px-4 flex items-center justify-center gap-2">
                <Edit3 size={14} /> 
                <span className="text-[10px] font-black uppercase tracking-widest">Modify</span>
              </button>
            ) : (
              <button onClick={handleSubmit(onSave)} disabled={saving} className="flex-1 sm:flex-none btn-primary !py-2 px-4 flex items-center justify-center gap-2">
                <Check size={14} /> 
                <span className="text-[10px] font-black uppercase tracking-widest">{saving ? 'Syncing…' : 'Finalize'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Supplier Info */}
          <div className="card p-5 sm:p-6 space-y-5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
              <div className="w-1 h-3 bg-primary-500 rounded-full" /> Entity Source
            </h3>
            <div className="space-y-4">
              <Field label="Supplier Name" name="supplier_name" />
              <Field label="Supplier GSTIN" name="supplier_gstin" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Invoice #" name="invoice_number" />
                <Field label="Date" name="invoice_date" />
              </div>
            </div>
          </div>

          {/* Buyer Info */}
          <div className="card p-5 sm:p-6 space-y-5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
              <div className="w-1 h-3 bg-success-500 rounded-full" /> Recipient Details
            </h3>
            <div className="space-y-4">
              <Field label="Buyer Name" name="buyer_name" />
              <Field label="Buyer GSTIN" name="buyer_gstin" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  {editing ? (
                    <select {...register('invoice_type')} className={clsx("input text-xs font-bold", isLight ? "bg-white" : "bg-slate-900")}>
                      <option value="purchase">Purchase</option>
                      <option value="sale">Sale</option>
                    </select>
                  ) : (
                    <div className={clsx("px-4 py-2.5 border rounded-xl text-xs font-bold capitalize", isLight ? "bg-white border-slate-200 text-[#0f172a]" : "bg-slate-950/50 border-slate-800 text-slate-200")}>
                      {invoice?.invoice_type}
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Tax Region</label>
                  <div className={clsx("px-4 py-2.5 border rounded-xl text-[10px] font-bold", isLight ? "bg-white border-slate-200 text-slate-500" : "bg-slate-950/50 border-slate-800 text-slate-400")}>
                    {invoice?.is_interstate ? 'INTER-STATE' : 'INTRA-STATE'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Amounts */}
          <div className="card p-5 sm:p-6 space-y-5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
              <div className="w-1 h-3 bg-warning-500 rounded-full" /> Financial Breakdown
            </h3>
            <div className="space-y-4">
              <Field label="Taxable Base (₹)" name="taxable_amount" type="number" />
              <div className="grid grid-cols-3 gap-3">
                <Field label="CGST" name="cgst" type="number" />
                <Field label="SGST" name="sgst" type="number" />
                <Field label="IGST" name="igst" type="number" />
              </div>
              <div className={clsx("pt-2 border-t", isLight ? "border-slate-100" : "border-white/5")}>
                <label className={clsx("label", isLight ? "text-primary-600" : "text-primary-400")}>Total Payable Amount</label>
                <div className={clsx("px-4 py-3 border rounded-xl text-lg font-black font-mono", isLight ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-primary-500/5 border-primary-500/20 text-white")}>
                  {formatCurrency(invoice?.total_amount)}
                </div>
              </div>
            </div>
          </div>

          {/* AI Metadata */}
          <div className="card p-5 sm:p-6 space-y-5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
              <div className="w-1 h-3 bg-purple-500 rounded-full" /> System Intelligence
            </h3>
            <div className="space-y-6">
              <div>
                <label className="label">OCR Confidence Score</label>
                <div className={clsx("mt-2 border p-4 rounded-xl", isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/50 border-slate-800")}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={clsx("text-[10px] font-bold uppercase tracking-widest", isLight ? "text-slate-400" : "text-slate-500")}>Extraction Quality</span>
                    <span className={clsx("text-sm font-black font-mono", isLight ? "text-[#0f172a]" : "text-white")}>{Math.round((invoice?.parser_confidence || 0) * 100)}%</span>
                  </div>
                  <div className={clsx("h-1.5 rounded-full overflow-hidden", isLight ? "bg-slate-200" : "bg-slate-800")}>
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-indigo-400 transition-all duration-1000"
                      style={{ width: `${(invoice?.parser_confidence || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <Field label="HSN / SAC Classifier" name="hsn_sac_code" />
              <div className={clsx("rounded-xl p-4 border", isLight ? "bg-blue-50/50 border-blue-100" : "bg-slate-900/40 border-slate-800/60")}>
                <p className={clsx("text-[10px] leading-relaxed italic", isLight ? "text-blue-600" : "text-slate-500")}>
                  AI has matched this invoice against GST rules. Please verify all amounts before final return filing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
