import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Upload, BarChart3, TrendingUp,
  Settings, Shield, ChevronRight, Zap, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user } = useAuth()
  const { theme } = useTheme()
  
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
        "fixed inset-y-0 left-0 shrink-0 flex flex-col h-screen z-50 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
        isCollapsed ? "w-[80px] min-w-[80px]" : "w-[260px] min-w-[260px]",
        isOpen ? "translate-x-0" : "-translate-x-full",
        theme === 'light' 
          ? "bg-white border-r border-[#e2e8f0] shadow-[2px_0_12px_rgba(0,0,0,0.04)]" 
          : "bg-[#080d1a] border-r border-white/5"
      )}>
        {/* Logo Section */}
        <div className={clsx(
          "px-6 py-6 flex items-center justify-between relative transition-all duration-300 border-b",
          theme === 'light' ? "border-slate-100" : "border-white/[0.06]"
        )}>
          <Link to="/" className="flex items-center gap-3 group overflow-hidden">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-[0_8px_30px_rgb(14,165,233,0.3)] group-hover:scale-105 transition-all duration-500 shrink-0">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="whitespace-nowrap"
              >
                <p className={`font-display font-black text-xl tracking-tighter ${theme === 'light' ? 'text-[#0f172a]' : 'text-white'}`}>GSTSmart</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-0.5">Automated Intelligence</p>
              </motion.div>
            )}
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:text-primary-600 transition-colors rounded-xl"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto relative custom-scrollbar">
          {!isCollapsed && (
            <p className="px-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">Main Menu</p>
          )}
          
          <div className="space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-[10px] text-[13px] font-bold transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? (theme === 'light' 
                        ? 'text-[#2563eb] bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] border-l-[3px] border-[#2563eb]' 
                        : 'text-[#00b4f5] bg-[#00b4f5]/10 border-l-[3px] border-[#00b4f5]')
                    : (theme === 'light' 
                        ? 'text-[#64748b] hover:text-[#374151] hover:bg-[#f1f5f9] hover:translate-x-1' 
                        : 'text-[#64748b] hover:text-[#e2e8f0] hover:bg-white/5 hover:translate-x-1')
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={clsx(
                      "shrink-0 transition-all duration-300",
                      isActive 
                        ? (theme === 'light' ? "text-[#2563eb]" : "text-[#00b4f5]") 
                        : (theme === 'light' ? "text-[#64748b] group-hover:text-[#374151]" : "text-[#64748b] group-hover:text-[#e2e8f0]")
                    )} size={18} />
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="truncate"
                      >
                        {label}
                      </motion.span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {user?.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-white/5">
              {!isCollapsed && (
                <p className="px-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">Administration</p>
              )}
              <NavLink
                to="/admin"
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-[10px] text-[13px] font-bold transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? 'text-amber-500 bg-amber-500/10 border-l-[3px] border-amber-500'
                    : 'text-[#64748b] hover:text-amber-200 hover:bg-white/5 hover:translate-x-1'
                )}
              >
                {({ isActive }) => (
                  <>
                    <Shield className={clsx(
                      "shrink-0 transition-all duration-300",
                      isActive ? "text-amber-500" : "text-[#64748b] group-hover:text-amber-200"
                    )} size={18} />
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="truncate"
                      >
                        Admin Portal
                      </motion.span>
                    )}
                  </>
                )}
              </NavLink>
            </div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto px-3 py-4 space-y-4">
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={clsx(
              "w-full flex items-center justify-center p-2.5 rounded-xl transition-all duration-200",
              theme === 'light' ? "hover:bg-slate-100 text-slate-400" : "hover:bg-white/5 text-slate-500"
            )}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <Zap size={18} className="rotate-180" />}
          </button>

          {/* User footer */}
          <div className={clsx(
            "p-2 rounded-[12px] transition-all duration-200 group cursor-pointer border",
            theme === 'light' 
              ? "bg-white border-[#e2e8f0] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-slate-50" 
              : "bg-[#0d1424] border-[#00b4f5]/15 hover:bg-[#0d1424]/80"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 shrink-0 bg-gradient-to-br from-[#2563eb] to-[#00b4f5] rounded-full flex items-center justify-center border border-white/20 shadow-inner">
                <span className="text-sm font-bold text-white uppercase">{user?.name?.[0]}{user?.name?.split(' ')?.[1]?.[0]}</span>
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className={clsx(
                      "text-sm font-bold truncate transition-colors",
                      theme === 'light' ? "text-[#0f172a]" : "text-slate-100 group-hover:text-white"
                    )}>{user?.name}</p>
                    <p className="text-[10px] font-black text-[#94a3b8] truncate uppercase tracking-wide mt-0.5">{user?.role?.replace('_', ' ')}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
