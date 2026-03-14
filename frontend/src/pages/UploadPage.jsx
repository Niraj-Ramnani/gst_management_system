import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { invoiceService } from '../services/api'
import { useNotification } from '../context/NotificationContext'
import clsx from 'clsx'

export default function UploadPage() {
  const { addPendingUpload } = useNotification()
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
      
      // Start tracking background parsing
      addPendingUpload(data.id, data.original_filename)

      toast.success('Upload successful! AI is parsing in the background.', { duration: 4000 })
      
      // Redirect to home/dashboard immediately
      navigate('/dashboard')

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
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in">
      <div>
        <h1 className="section-title text-xl sm:text-2xl">Upload Invoice</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Upload a PDF or image. Our AI will extract all GST fields automatically.</p>
      </div>

      {!result ? (
        <div className="card p-5 sm:p-8 space-y-6 sm:space-y-8">
          {/* Invoice Type */}
          <div>
            <label className="label">Invoice Type</label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {['purchase', 'sale'].map(type => (
                <button
                  key={type}
                  onClick={() => setInvoiceType(type)}
                  className={clsx(
                    'py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest border-2 transition-all',
                    invoiceType === type
                      ? 'border-primary-500 bg-primary-900/30 text-primary-400'
                      : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:border-slate-700'
                  )}
                >
                  {type}
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
              'border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer group',
              dragging ? 'border-primary-500 bg-primary-900/20' : 'border-slate-800 hover:border-slate-700 hover:bg-white/[0.01]'
            )}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input id="file-input" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileSelect} />
            {file ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-success-500/10 rounded-2xl flex items-center justify-center border border-success-500/20">
                  <FileText size={32} className="text-success-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1 font-mono uppercase">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 rounded-lg border border-red-500/20 transition-colors"
                >
                  <X size={12} /> Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:border-primary-500/30 transition-colors">
                  <Upload size={32} className="text-slate-600 group-hover:text-primary-400 transition-colors" />
                </div>
                <div>
                  <p className="font-bold text-slate-300 text-sm sm:text-base">Drag & drop your invoice here</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">or click to browse your files</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {['PDF', 'JPG', 'PNG'].map(ext => (
                    <span key={ext} className="badge-default text-[10px] sm:text-xs">{ext}</span>
                  ))}
                  <span className="badge-default text-[10px] sm:text-xs">Max 10MB</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary w-full py-4 text-xs sm:text-sm font-black uppercase tracking-widest"
          >
            {uploading ? (
              <><Loader size={18} className="animate-spin" /> Processing…</>
            ) : (
              <><Upload size={18} /> Upload & Scan</>
            )}
          </button>

          <div className="bg-slate-950/40 rounded-2xl p-5 border border-slate-800/60 backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 sm:mb-5">Next Steps:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {[
                { title: 'AI Extraction', desc: 'Fields & Tax detection' },
                { title: 'Tax Validation', desc: 'GSTIN & HSN checks' },
                { title: 'Compliance', desc: 'Auto CGST/SGST splitting' },
                { title: 'Verification', desc: 'Human-in-the-loop review' },
              ].map(step => (
                <div key={step.title} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary-500/10 rounded flex items-center justify-center border border-primary-500/20 shrink-0 mt-0.5">
                    <CheckCircle size={10} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-300 uppercase leading-none mb-1">{step.title}</p>
                    <p className="text-[10px] text-slate-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card-premium p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-success-500/20 rounded-3xl flex items-center justify-center mx-auto border border-success-500/30">
            <CheckCircle size={40} className="text-success-400" />
          </div>
          <div className="space-y-2">
            <h2 className="section-title text-xl sm:text-2xl">Upload Complete</h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Your invoice is being analyzed by our AI engine. We'll notify you once extraction is complete.
            </p>
          </div>
          
          <div className="bg-slate-950/60 rounded-2xl p-6 border border-white/5 text-left space-y-3 backdrop-blur-md">
            {[
              { label: 'Invoice ID', val: result.id, mono: true },
              { label: 'Filename', val: result.original_filename },
              { label: 'Category', val: result.invoice_type },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center text-[10px] sm:text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-widest">{row.label}</span>
                <span className={clsx("text-slate-200 truncate max-w-[150px]", row.mono && "font-mono")}>{row.val}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-[10px] sm:text-xs pt-2 border-t border-white/5">
              <span className="font-bold text-slate-500 uppercase tracking-widest">Status</span>
              <StatusBadge status={result.status} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => navigate(`/invoices/${result.id}`)}
              className="btn-primary flex-1 py-3 font-black text-xs uppercase tracking-widest"
            >
              Review Now
            </button>
            <button
              onClick={() => { setFile(null); setResult(null) }}
              className="btn-secondary flex-1 py-3 font-black text-xs uppercase tracking-widest"
            >
              Scan Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
