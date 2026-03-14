import { Bell, LogOut, Search, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'
import NotificationDropdown from './NotificationDropdown'

export default function TopNav({ onMenuClick }) {
  const { logout, user } = useAuth()
  const { unreadCount } = useNotification()
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return (
    <header className="h-16 sm:h-20 bg-slate-950/20 backdrop-blur-xl border-b border-white/5 flex items-center px-4 sm:px-8 gap-4 sm:gap-6 shrink-0 sticky top-0 z-30">
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 max-w-xl hidden sm:block">
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
          <input
            type="text"
            placeholder="Quick search..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-11 pr-5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/40 transition-all duration-300 backdrop-blur-sm"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-xl sm:rounded-2xl transition-all border border-transparent hover:border-white/5 overflow-hidden group"
          >
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-primary-500 text-[9px] sm:text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-[#020617] shadow-[0_0_8px_rgba(14,165,233,0.5)]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          <NotificationDropdown 
            isOpen={notificationsOpen} 
            onClose={() => setNotificationsOpen(false)} 
          />
        </div>
        
        <div className="h-6 w-px bg-white/5 mx-1 sm:mx-2" />
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 p-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all text-xs font-bold uppercase tracking-widest active:scale-95"
        >
          <LogOut size={18} className="sm:hidden" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
