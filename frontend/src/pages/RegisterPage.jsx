import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Zap, ArrowRight } from 'lucide-react'

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
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] animate-in">
        <div className="text-center mb-10">
          <div className="inline-flex w-14 h-14 bg-primary-600 rounded-[1.25rem] items-center justify-center mb-6 shadow-[0_20px_50px_rgba(14,165,233,0.3)] -rotate-3">
            <Zap size={28} className="text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Create account</h1>
          <p className="text-slate-500 text-sm font-medium tracking-wide">AI-powered GST management starts here</p>
        </div>

        <div className="card p-10 border-white/10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div className="input-group">
              <input
                {...register('name', { required: 'Name is required' })}
                id="name"
                placeholder=" "
                className="input peer"
              />
              <label htmlFor="name" className="floating-label">Full Name</label>
              {errors.name && <p className="text-[10px] font-bold text-danger mt-1.5 ml-1 uppercase tracking-wider">{errors.name.message}</p>}
            </div>

            <div className="input-group">
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                type="email"
                id="reg-email"
                placeholder=" "
                className="input peer"
              />
              <label htmlFor="reg-email" className="floating-label">Email address</label>
              {errors.email && <p className="text-[10px] font-bold text-danger mt-1.5 ml-1 uppercase tracking-wider">{errors.email.message}</p>}
            </div>

            <div className="input-group">
              <input
                {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
                type="password"
                id="reg-password"
                placeholder=" "
                className="input peer"
              />
              <label htmlFor="reg-password" className="floating-label">Password</label>
              {errors.password && <p className="text-[10px] font-bold text-danger mt-1.5 ml-1 uppercase tracking-wider">{errors.password.message}</p>}
            </div>

            <div className="input-group">
              <select {...register('role')} className="input cursor-pointer appearance-none">
                <option value="business_owner">Business Owner</option>
                <option value="accountant">Accountant</option>
              </select>
              <label className="floating-label !-top-2.5 !left-3 !text-xs !text-primary-400 !bg-[#0b1120] !px-1">Role</label>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-sm tracking-widest uppercase mt-2">
              {isSubmitting ? 'Creating account…' : <><span>Create account</span><ArrowRight size={18} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm font-semibold text-slate-500 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
