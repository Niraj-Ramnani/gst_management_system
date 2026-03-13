import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-primary-600 rounded-2xl items-center justify-center mb-4 shadow-glow">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Welcome back</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your GSTSmart account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                  type="email"
                  placeholder="you@company.com"
                  className="input pl-10"
                />
              </div>
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type="password"
                  placeholder="••••••••"
                  className="input pl-10"
                />
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {isSubmitting ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-sm text-slate-400 text-center mb-3">Demo accounts:</p>
            <div className="space-y-2 text-xs font-mono">
              {[
                ['Owner', 'raj@business.demo', 'demo1234'],
                ['Admin', 'admin@gst.demo', 'admin123'],
                ['Accountant', 'priya@accounts.demo', 'demo1234'],
              ].map(([role, email, pass]) => (
                <div key={role} className="flex items-center justify-between bg-surface-950 rounded-lg px-3 py-2">
                  <span className="text-slate-500">{role}:</span>
                  <span className="text-slate-300">{email}</span>
                  <span className="text-primary-400">{pass}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
