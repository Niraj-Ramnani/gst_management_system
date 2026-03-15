import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'

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
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] animate-in">
        <div className="text-center mb-10">
          <div className="inline-flex w-14 h-14 bg-primary-600 rounded-[1.25rem] items-center justify-center mb-6 shadow-[0_20px_50px_rgba(14,165,233,0.3)] rotate-3">
            <Zap size={28} className={isLight ? "text-white" : "text-black"} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Welcome back</h1>
          <p className="text-slate-500 text-sm font-medium tracking-wide">Sign in to your GSTSmart account</p>
        </div>

        <div className="card p-10 border-white/10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div className="input-group">
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                type="email"
                id="email"
                placeholder=" "
                className="input peer"
              />
              <label htmlFor="email" className="floating-label">Email address</label>
              {errors.email && <p className="text-[10px] font-bold text-danger mt-1.5 ml-1 uppercase tracking-wider">{errors.email.message}</p>}
            </div>

            <div className="input-group">
              <input
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                type="password"
                id="password"
                placeholder=" "
                className="input peer"
              />
              <label htmlFor="password" className="floating-label">Password</label>
              {errors.password && <p className="text-[10px] font-bold text-danger mt-1.5 ml-1 uppercase tracking-wider">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-sm tracking-widest uppercase">
              {isSubmitting ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5">
            <p className="text-[10px] font-black text-slate-500 text-center uppercase tracking-[0.2em] mb-4">Demo Access</p>
            <div className="space-y-2.5">
              {[
                ['Owner', 'raj@business.demo', 'demo1234'],
                ['Admin', 'admin@gst.demo', 'admin123'],
                ['Accountant', 'priya@accounts.demo', 'demo1234'],
              ].map(([role, email, pass]) => (
                <div key={role} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 group/demo hover:bg-white/[0.05] transition-all cursor-default">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{role}</span>
                    <span className="text-xs font-bold text-slate-300 group-hover/demo:text-white transition-colors">{email}</span>
                  </div>
                  <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-2 py-1 rounded-md border border-primary-500/20">{pass}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm font-semibold text-slate-500 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 transition-colors">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
