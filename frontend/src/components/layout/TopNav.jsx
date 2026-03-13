import { Bell, LogOut, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function TopNav() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return (
    <header className="h-20 bg-surface-950/20 backdrop-blur-xl border-b border-white/5 flex items-center px-8 gap-6 shrink-0 sticky top-0 z-30">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
          <input
            type="text"
            placeholder="Quick search: Invoices, Suppliers, GSTIN..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-11 pr-5 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/40 transition-all duration-300 backdrop-blur-sm shadow-inner"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-auto">
        <button className="relative w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-2xl transition-all border border-transparent hover:border-white/5 overflow-hidden group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-primary-500 rounded-full border-2 border-surface-950 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
        </button>
        
        <div className="h-6 w-px bg-white/5 mx-2" />
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-danger/10 border border-white/5 hover:border-danger/20 px-4 py-2.5 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest active:scale-95"
        >
          <LogOut size={16} strokeWidth={2.5} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  )
}
