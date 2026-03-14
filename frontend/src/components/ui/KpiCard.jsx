import clsx from 'clsx'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function KpiCard({ title, value, subtitle, icon: Icon, color = 'primary', trend, trendValue }) {
  const colorMap = {
    primary: 'text-primary-400 bg-primary-500/10 border-primary-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]',
    success: 'text-success-400 bg-success-500/10 border-success-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
    warning: 'text-warning-400 bg-warning-500/10 border-warning-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    danger: 'text-danger-400 bg-danger-500/10 border-danger-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]',
  }

  return (
    <motion.div 
      whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
      className="kpi-card group border border-white/5 bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl transition-all duration-500"
    >
      <div className="kpi-card-glow" />
      <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-start justify-between relative z-10 mb-6">
        {Icon && (
          <div className={clsx(
            'p-3.5 rounded-2xl border transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.2)]', 
            colorMap[color]
          )}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
        )}
        {trend && (
          <div className={clsx(
            'flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm',
            trend === 'up' ? 'bg-success-500/10 text-success-400 border-success-500/20 shadow-success-500/5' :
            trend === 'down' ? 'bg-danger-500/10 text-danger-400 border-danger-500/20 shadow-danger-500/5' :
            'bg-slate-800/80 text-slate-400 border-slate-700/50'
          )}>
            {trend === 'up' ? <TrendingUp size={12} strokeWidth={3} /> : trend === 'down' ? <TrendingDown size={12} strokeWidth={3} /> : <Minus size={12} strokeWidth={3} />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5 ml-0.5">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight font-tabular leading-none">{value}</h4>
        </div>
        {subtitle && (
          <p className="text-xs font-semibold text-slate-500 mt-4 flex items-center gap-2 group-hover:text-slate-400 transition-colors">
            <span className={clsx("w-1.5 h-1.5 rounded-full", trend === 'up' ? "bg-success-500" : trend === 'down' ? "bg-danger-500" : "bg-slate-600")} />
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  )
}
