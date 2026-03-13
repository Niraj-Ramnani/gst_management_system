import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Edit3, Check, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { invoiceService } from '../services/api'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/formatters'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm()

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
    try {
      await invoiceService.reparse(id)
      toast.success('Re-parsing started. Refresh in a moment.')
      setTimeout(loadInvoice, 3000)
    } catch { toast.error('Reparse failed') }
  }



  if (loading) return <LoadingSpinner className="h-64" />

  const Field = ({ label, name, type = 'text', readOnly = false }) => (
    <div>
      <label className="label">{label}</label>
      {editing && !readOnly ? (
        <input {...register(name)} type={type} step="0.01" className="input text-sm" />
      ) : (
        <p className="text-sm text-slate-200 bg-surface-950 border border-slate-800 rounded-xl px-4 py-2.5">
          {type === 'number' ? formatCurrency(invoice?.[name]) : (invoice?.[name] || '—')}
        </p>
      )}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/invoices')} className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl text-white">Invoice Detail</h1>
          <p className="text-slate-400 text-sm">{invoice?.original_filename}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={invoice?.status} />
          <button onClick={handleReparse} className="btn-ghost p-2" title="Re-parse">
            <RefreshCw size={16} />
          </button>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-1.5">
              <Edit3 size={14} /> Edit
            </button>
          ) : (
            <button onClick={handleSubmit(onSave)} disabled={saving} className="btn-primary flex items-center gap-1.5">
              <Check size={14} /> {saving ? 'Saving…' : 'Verify & Save'}
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSave)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supplier Info */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <div className="w-1.5 h-4 bg-primary-500 rounded-full" /> Supplier Information
            </h3>
            <Field label="Supplier Name" name="supplier_name" />
            <Field label="Supplier GSTIN" name="supplier_gstin" />
            <Field label="Invoice Number" name="invoice_number" />
            <Field label="Invoice Date" name="invoice_date" type="text" />
          </div>

          {/* Buyer Info */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <div className="w-1.5 h-4 bg-success-500 rounded-full" /> Buyer Information
            </h3>
            <Field label="Buyer Name" name="buyer_name" />
            <Field label="Buyer GSTIN" name="buyer_gstin" />
            <div>
              <label className="label">Invoice Type</label>
              {editing ? (
                <select {...register('invoice_type')} className="input text-sm">
                  <option value="purchase">Purchase</option>
                  <option value="sale">Sale</option>
                </select>
              ) : (
                <p className="text-sm text-slate-200 bg-surface-950 border border-slate-800 rounded-xl px-4 py-2.5 capitalize">
                  {invoice?.invoice_type}
                </p>
              )}
            </div>
            <div>
              <label className="label">Transaction Type</label>
              <p className="text-sm text-slate-200 bg-surface-950 border border-slate-800 rounded-xl px-4 py-2.5">
                {invoice?.is_interstate ? '🌐 Inter-state (IGST)' : '🏠 Intra-state (CGST + SGST)'}
              </p>
            </div>
          </div>

          {/* Tax Amounts */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <div className="w-1.5 h-4 bg-warning-500 rounded-full" /> Tax Breakdown
            </h3>
            <Field label="Taxable Amount (₹)" name="taxable_amount" type="number" />
            <Field label="CGST (₹)" name="cgst" type="number" />
            <Field label="SGST (₹)" name="sgst" type="number" />
            <Field label="IGST (₹)" name="igst" type="number" />
            <Field label="Total Amount (₹)" name="total_amount" type="number" readOnly />
          </div>

          {/* AI Metadata */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <div className="w-1.5 h-4 bg-purple-500 rounded-full" /> AI Analysis
            </h3>
            <div>
              <label className="label">Parser Confidence</label>
              <div className="mt-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Extraction accuracy</span>
                  <span className="text-slate-200 font-mono">{Math.round((invoice?.parser_confidence || 0) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
                    style={{ width: `${(invoice?.parser_confidence || 0) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="label">HSN / SAC Code</label>
              <p className="text-sm text-slate-200 bg-surface-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono">
                {invoice?.hsn_sac_code || '—'}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
