import { NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Upload, BarChart3, TrendingUp,
  Settings, Shield, ChevronRight, Zap, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/upload', icon: Upload, label: 'Upload Invoice' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/forecast', icon: TrendingUp, label: 'Forecast' },
  { to: '/profile', icon: Settings, label: 'Business Profile' },
]

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth()
  
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={clsx(
        "fixed inset-y-0 left-0 w-72 bg-[#0b1120] border-r border-slate-800/60 flex flex-col h-screen shrink-0 z-50 transition-transform duration-500 ease-[0.16, 1, 0.3, 1] lg:relative lg:translate-x-0 lg:w-64",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none" />
        
        {/* Logo */}
        <div className="px-6 py-8 flex items-center justify-between relative">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <p className="font-display font-black text-white text-xl tracking-tight">GST<span className="text-primary-400">Smart</span></p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Next-Gen Compliance</p>
            </div>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto relative custom-scrollbar">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden',
                isActive
                  ? 'text-primary-400'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-primary-500/10 border border-primary-500/20 rounded-xl z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={clsx("relative z-10 transition-colors duration-300", isActive ? "text-primary-400" : "text-slate-500 group-hover:text-slate-300")} size={18} />
                  <span className="relative z-10">{label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeDot"
                      className="absolute right-4 w-1.5 h-1.5 bg-primary-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)]" 
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 mt-4 relative overflow-hidden',
                isActive
                  ? 'text-amber-400'
                  : 'text-slate-500 hover:text-amber-200'
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded-xl z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Shield className={clsx("relative z-10 transition-colors duration-300", isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300")} size={18} />
                  <span className="relative z-10">Admin Portal</span>
                </>
              )}
            </NavLink>
          )}
        </nav>

        {/* User footer */}
        <div className="px-4 py-6 border-t border-slate-800/60 bg-black/5 backdrop-blur-md">
          <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/[0.03] transition-all group cursor-pointer border border-transparent hover:border-slate-800/40">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center border border-slate-700/50 group-hover:border-primary-500/30 transition-colors">
              <span className="text-sm font-black text-white">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">{user?.name}</p>
              <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
          </div>
        </div>
      </aside>
    </>
  )
}
