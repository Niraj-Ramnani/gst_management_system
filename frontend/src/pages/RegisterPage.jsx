import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      await authRegister(data.name, data.email, data.password, data.role)
      toast.success('Account created!')
      navigate('/profile')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-primary-600 rounded-2xl items-center justify-center mb-4 shadow-glow">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Create your account</h1>
          <p className="text-slate-400 mt-1 text-sm">Get started with AI-powered GST management</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input {...register('name', { required: 'Name is required' })} placeholder="Raj Sharma" className="input pl-10" />
              </div>
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} type="email" placeholder="you@company.com" className="input pl-10" />
              </div>
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })} type="password" placeholder="••••••••" className="input pl-10" />
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Role</label>
              <select {...register('role')} className="input">
                <option value="business_owner">Business Owner</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {isSubmitting ? 'Creating account…' : <><span>Create account</span><ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
