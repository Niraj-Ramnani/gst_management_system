import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { invoiceService } from '../services/api'
import clsx from 'clsx'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [invoiceType, setInvoiceType] = useState('purchase')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const navigate = useNavigate()

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && ['application/pdf', 'image/jpeg', 'image/png'].includes(dropped.type)) {
      setFile(dropped)
    } else {
      toast.error('Only PDF, JPG, PNG files are supported')
    }
  }, [])

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    if (selected) setFile(selected)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const { data } = await invoiceService.upload(file, invoiceType)
      setResult(data)
      toast.success('Invoice uploaded! AI parsing in progress…')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Upload Invoice</h1>
        <p className="text-slate-400 text-sm mt-1">Upload a PDF or image. Our AI will extract all GST fields automatically.</p>
      </div>

      {!result ? (
        <div className="card p-8 space-y-6">
          {/* Invoice Type */}
          <div>
            <label className="label">Invoice Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['purchase', 'sale'].map(type => (
                <button
                  key={type}
                  onClick={() => setInvoiceType(type)}
                  className={clsx(
                    'py-3 rounded-xl text-sm font-semibold border-2 transition-all capitalize',
                    invoiceType === type
                      ? 'border-primary-500 bg-primary-900/30 text-primary-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  )}
                >
                  {type} Invoice
                </button>
              ))}
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={clsx(
              'border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer',
              dragging ? 'border-primary-500 bg-primary-900/20' : 'border-slate-700 hover:border-slate-600'
            )}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input id="file-input" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileSelect} />
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-success-900/30 rounded-2xl flex items-center justify-center">
                  <FileText size={28} className="text-success-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="text-xs text-danger-400 hover:text-danger-300 flex items-center gap-1"
                >
                  <X size={12} /> Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center">
                  <Upload size={28} className="text-slate-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300">Drag & drop your invoice here</p>
                  <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                </div>
                <div className="flex gap-2 mt-1">
                  {['PDF', 'JPG', 'PNG'].map(ext => (
                    <span key={ext} className="badge-default text-xs">{ext}</span>
                  ))}
                  <span className="badge-default text-xs">Max 10MB</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><Loader size={16} className="animate-spin" /> Uploading & parsing…</>
            ) : (
              <><Upload size={16} /> Upload & Parse Invoice</>
            )}
          </button>

          <div className="bg-surface-950 rounded-xl p-4 border border-slate-800">
            <p className="text-xs text-slate-400 font-semibold mb-2">What happens after upload:</p>
            <div className="space-y-1.5">
              {[
                'AI extracts invoice number, dates, GSTINs, tax amounts',
                'Automatic classification of HSN/SAC codes',
                'GST is calculated and classified (CGST/SGST/IGST)',
                'You can review, correct, and verify all fields',
              ].map(step => (
                <div key={step} className="flex items-start gap-2 text-xs text-slate-500">
                  <CheckCircle size={12} className="text-primary-500 mt-0.5 shrink-0" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-success-900/30 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-success-400" />
          </div>
          <h2 className="font-display font-bold text-xl text-white">Invoice uploaded successfully!</h2>
          <p className="text-slate-400 text-sm">
            AI parsing is running in the background. Your invoice will be ready to review in a few seconds.
          </p>
          <div className="bg-surface-950 rounded-xl p-4 border border-slate-800 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Invoice ID</span>
              <span className="font-mono text-slate-300 text-xs">{result.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">File</span>
              <span className="text-slate-300">{result.original_filename}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Type</span>
              <span className="text-slate-300 capitalize">{result.invoice_type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Status</span>
              <span className="badge-info">{result.status}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/invoices/${result.id}`)}
              className="btn-primary flex-1 py-2.5"
            >
              Review Invoice
            </button>
            <button
              onClick={() => { setFile(null); setResult(null) }}
              className="btn-secondary flex-1 py-2.5"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
