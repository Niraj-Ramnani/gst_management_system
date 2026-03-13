import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Building2, Save, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { businessService } from '../services/api'
import { INDIAN_STATES } from '../utils/formatters'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exists, setExists] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    businessService.getProfile()
      .then(({ data }) => { reset(data); setExists(true) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (exists) {
        await businessService.updateProfile(data)
      } else {
        await businessService.createProfile(data)
        setExists(true)
      }
      toast.success('Business profile saved!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Business Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Your GST registration details used for return calculations</p>
      </div>

      <div className="card p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
          <div className="w-10 h-10 bg-primary-900/30 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-white">GST Registration Details</p>
            <p className="text-xs text-slate-400">Required for GST return filing</p>
          </div>
          {exists && <span className="ml-auto badge-success"><CheckCircle size={12} /> Configured</span>}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Business Name *</label>
              <input {...register('business_name', { required: 'Required' })} className="input" placeholder="Raj Electronics & Trading Co." />
              {errors.business_name && <p className="text-xs text-danger mt-1">{errors.business_name.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="label">GSTIN *</label>
              <input
                {...register('gstin', {
                  required: 'GSTIN is required',
                  pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GSTIN format' }
                })}
                className="input font-mono"
                placeholder="29AABCR1234A1Z5"
                maxLength={15}
              />
              {errors.gstin && <p className="text-xs text-danger mt-1">{errors.gstin.message}</p>}
              <p className="text-xs text-slate-500 mt-1">Format: 2-digit state code + 10-char PAN + entity type + Z + checksum</p>
            </div>

            <div>
              <label className="label">State *</label>
              <select {...register('state', { required: 'Required' })} className="input text-sm">
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
              </select>
              {errors.state && <p className="text-xs text-danger mt-1">{errors.state.message}</p>}
            </div>

            <div>
              <label className="label">State Code *</label>
              <select {...register('state_code', { required: 'Required' })} className="input text-sm">
                <option value="">Select</option>
                {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.code} — {s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="label">PAN</label>
              <input {...register('pan')} className="input font-mono" placeholder="AABCR1234A" maxLength={10} />
            </div>

            <div>
              <label className="label">Filing Frequency</label>
              <select {...register('filing_frequency')} className="input text-sm">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div>
              <label className="label">Contact Email</label>
              <input {...register('contact_email')} type="email" className="input" placeholder="accounts@company.com" />
            </div>

            <div>
              <label className="label">Contact Phone</label>
              <input {...register('contact_phone')} className="input" placeholder="+91-9876543210" />
            </div>

            <div className="md:col-span-2">
              <label className="label">Business Address</label>
              <textarea {...register('address')} rows={3} className="input resize-none" placeholder="Full registered address…" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16} />
            {saving ? 'Saving…' : exists ? 'Update Profile' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
