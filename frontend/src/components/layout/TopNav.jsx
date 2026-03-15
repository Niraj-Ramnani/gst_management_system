import { Bell, LogOut, Search, Menu, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'
import NotificationDropdown from './NotificationDropdown'

export default function TopNav({ onMenuClick }) {
  const { logout, user } = useAuth()
  const { unreadCount } = useNotification()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return (
    <header 
      className={`h-16 sm:h-20 backdrop-blur-xl border-b flex items-center px-4 sm:px-8 gap-4 sm:gap-6 shrink-0 sticky top-0 z-30 transition-all duration-300 ${
        theme === 'light' 
          ? 'bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-[#e2e8f0]' 
          : 'bg-[#0a0f1e]/80 border-white/5'
      }`}
    >
      <button 
        onClick={onMenuClick}
        className={`lg:hidden p-2 transition-colors ${
          theme === 'light' ? 'text-slate-500 hover:text-[#0f172a]' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 max-w-xl hidden sm:block">
        <div className="relative group">
          <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${theme === 'light' ? 'text-slate-400 group-focus-within:text-primary-600' : 'text-slate-500 group-focus-within:text-primary-400'}`} />
          <input
            type="text"
            placeholder="Quick search..."
            className={`w-full border rounded-2xl pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
              theme === 'light'
                ? 'bg-[#f1f5f9] border-transparent text-[#0f172a] placeholder-slate-400 focus:bg-white focus:ring-[#2563eb]/20 focus:border-[#2563eb]'
                : 'bg-white/[0.03] border-white/5 text-slate-200 placeholder-slate-600 focus:ring-primary-500/20 focus:border-primary-500/40'
            }`}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all border overflow-hidden group ${
              theme === 'light'
                ? 'text-slate-500 hover:text-[#2563eb] hover:bg-[#eff6ff] border-transparent hover:border-[#bfdbfe]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border-transparent hover:border-white/5'
            }`}
          >
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className={`absolute top-2 right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-primary-500 text-[9px] sm:text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 shadow-[0_0_8px_rgba(14,165,233,0.5)] ${theme === 'light' ? 'border-white' : 'border-[#050a14]'}`}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          <NotificationDropdown 
            isOpen={notificationsOpen} 
            onClose={() => setNotificationsOpen(false)} 
          />
        </div>
        
        <div className={`h-6 w-px mx-1 sm:mx-2 ${theme === 'light' ? 'bg-[#e2e8f0]' : 'bg-white/5'}`} />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all border border-transparent hover:border-white/10 overflow-hidden group"
          style={{
            background: theme === 'light'
              ? 'rgba(14, 165, 233, 0.08)'
              : 'rgba(255, 255, 255, 0.03)',
          }}
        >
          <span
            className="absolute inset-0 flex items-center justify-center transition-all duration-500"
            style={{
              opacity: theme === 'dark' ? 1 : 0,
              transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)',
            }}
          >
            <Moon size={18} className="text-slate-400 group-hover:text-primary-400 transition-colors" />
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center transition-all duration-500"
            style={{
              opacity: theme === 'light' ? 1 : 0,
              transform: theme === 'light' ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)',
            }}
          >
            <Sun size={18} className="text-amber-400" />
          </span>
        </button>

        <div className={`h-6 w-px mx-1 sm:mx-2 ${theme === 'light' ? 'bg-[#e2e8f0]' : 'bg-white/5'}`} />
        
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 border p-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all text-xs font-bold uppercase tracking-widest active:scale-95 ${
            theme === 'light'
              ? 'text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 border-transparent hover:border-red-200'
              : 'text-slate-400 hover:text-white bg-white/[0.02] hover:bg-red-500/10 border-white/5 hover:border-red-500/20'
          }`}
        >
          <LogOut size={18} className="sm:hidden" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
