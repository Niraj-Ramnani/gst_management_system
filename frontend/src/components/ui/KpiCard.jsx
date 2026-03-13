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
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="kpi-card relative overflow-hidden group border border-slate-800/60 bg-[#0b1120] p-6 rounded-2x transition-all duration-300"
    >
      <div className="absolute top-0 right-0 p-8 -mr-8 -mt-8 bg-gradient-to-br from-white/[0.03] to-transparent rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10 mb-5">
        {Icon && (
          <div className={clsx('p-3 rounded-2xl border transition-transform group-hover:scale-110 duration-500', colorMap[color])}>
            <Icon size={22} strokeWidth={2.5} />
          </div>
        )}
        {trend && (
          <div className={clsx(
            'flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl border',
            trend === 'up' ? 'bg-success-500/5 text-success-400 border-success-500/20' :
            trend === 'down' ? 'bg-danger-500/5 text-danger-400 border-danger-500/20' :
            'bg-slate-800/50 text-slate-400 border-slate-700/50'
          )}>
            {trend === 'up' ? <TrendingUp size={12} strokeWidth={3} /> : trend === 'down' ? <TrendingDown size={12} strokeWidth={3} /> : <Minus size={12} strokeWidth={3} />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.05em] mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-3xl font-display font-black text-white tracking-tight">{value}</h4>
        </div>
        {subtitle && (
          <p className="text-xs font-medium text-slate-600 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  )
}
