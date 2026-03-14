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
        "fixed inset-y-0 left-0 w-72 bg-[#020617]/95 backdrop-blur-3xl border-r border-white/5 flex flex-col h-screen shrink-0 z-50 transition-transform duration-500 ease-[0.16, 1, 0.3, 1] lg:relative lg:translate-x-0 lg:w-72",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/[0.03] to-transparent pointer-events-none" />
        
        {/* Logo */}
        <div className="px-8 py-10 flex items-center justify-between relative">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-11 h-11 bg-primary-600 rounded-[1.2rem] flex items-center justify-center shadow-[0_8px_30px_rgb(14,165,233,0.3)] group-hover:scale-105 group-hover:rotate-6 transition-all duration-500">
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <p className="font-display font-black text-white text-2xl tracking-tighter">GST<span className="text-primary-400">Smart</span></p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-0.5">Automated Intelligence</p>
            </div>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto relative custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 group relative overflow-hidden',
                isActive
                  ? 'text-primary-400 shadow-[0_0_20px_rgba(14,165,233,0.05)]'
                  : 'text-slate-400 hover:text-slate-100'
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent border-l-2 border-primary-500 z-0"
                      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    />
                  )}
                  <Icon className={clsx("relative z-10 transition-all duration-300 group-hover:scale-110", isActive ? "text-primary-400" : "text-slate-500 group-hover:text-slate-200")} size={20} />
                  <span className="relative z-10">{label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeDot"
                      className="absolute right-4 w-1.5 h-1.5 bg-primary-400 rounded-full shadow-[0_0_12px_rgba(56,189,248,1)]" 
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          
          {user?.role === 'admin' && (
            <div className="pt-6 mt-6 border-t border-white/5">
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Administration</p>
              <NavLink
                to="/admin"
                className={({ isActive }) => clsx(
                  'flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 group relative overflow-hidden',
                  isActive
                    ? 'text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.05)]'
                    : 'text-slate-400 hover:text-amber-200'
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500 z-0"
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                      />
                    )}
                    <Shield className={clsx("relative z-10 transition-all duration-300 group-hover:scale-110", isActive ? "text-amber-400" : "text-slate-500 group-hover:text-amber-200")} size={20} />
                    <span className="relative z-10">Admin Portal</span>
                  </>
                )}
              </NavLink>
            </div>
          )}
        </nav>

        {/* User footer */}
        <div className="px-6 py-8 border-t border-white/5 bg-slate-900/40 backdrop-blur-xl">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all group cursor-pointer border border-white/5 hover:border-white/10">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary-500/30 transition-all shadow-inner">
              <span className="text-base font-black text-white">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-100 truncate group-hover:text-white transition-colors">{user?.name}</p>
              <p className="text-[10px] font-black text-slate-500 truncate uppercase tracking-[0.15em] mt-0.5">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </aside>
    </>
  )
}
