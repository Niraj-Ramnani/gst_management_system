import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function KpiCard({ title, value, subtitle, icon: Icon, color = 'primary', trend, trendValue }) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const colorMap = {
    primary: {
        bottomBorder: isLight ? '#2563eb' : '#3b82f6',
        iconBg: isLight ? '#eff6ff' : 'rgba(37,99,235,0.12)',
        iconColor: isLight ? '#2563eb' : '#3b82f6',
    },
    success: {
        bottomBorder: isLight ? '#16a34a' : '#22c55e',
        iconBg: isLight ? '#f0fdf4' : 'rgba(34,197,94,0.12)',
        iconColor: isLight ? '#16a34a' : '#22c55e',
    },
    purple: {
        bottomBorder: isLight ? '#7c3aed' : '#8b5cf6',
        iconBg: isLight ? '#f5f3ff' : 'rgba(139,92,246,0.12)',
        iconColor: isLight ? '#7c3aed' : '#8b5cf6',
    },
    cyan: {
        bottomBorder: isLight ? '#0891b2' : '#00b4f5',
        iconBg: isLight ? '#ecfeff' : 'rgba(0,180,245,0.12)',
        iconColor: isLight ? '#0891b2' : '#00b4f5',
    }
  }

  const conf = colorMap[color] || colorMap.primary

  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.3, ease: 'easeOut' } }}
      className="relative flex flex-col justify-between rounded-[24px] transition-all duration-300"
      style={{
        minHeight: '160px',
        padding: '28px',
        backgroundColor: isLight ? '#ffffff' : '#0d1424',
        border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(0,180,245,0.15)',
        borderBottom: `3px solid ${conf.bottomBorder}`,
        boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div 
            className="flex items-center justify-center rounded-2xl shrink-0"
            style={{ width: '44px', height: '44px', backgroundColor: conf.iconBg }}
          >
            <Icon size={22} style={{ color: conf.iconColor }} strokeWidth={2.5} />
          </div>
        )}
        {trend && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}>
            {trend === 'up' ? <TrendingUp size={14} style={{ color: '#22c55e' }} strokeWidth={3} /> : trend === 'down' ? <TrendingDown size={14} style={{ color: '#ef4444' }} strokeWidth={3} /> : <Minus size={14} style={{ color: '#94a3b8' }} strokeWidth={3} />}
            <span className="text-[11px] font-bold" style={{ color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#94a3b8' }}>{trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col mt-auto">
        <h4 
          className="font-display font-black tracking-tight font-tabular leading-none whitespace-nowrap overflow-visible mb-1.5"
          style={{ 
            color: isLight ? '#0f172a' : '#ffffff',
            fontSize: 'clamp(24px, 2.5vw, 32px)'
          }}
          title={String(value)}
        >
          {value}
        </h4>
        <p 
          className="text-[12px] font-bold uppercase tracking-widest truncate"
          style={{ color: isLight ? '#64748b' : '#94a3b8' }}
        >
          {title}
        </p>
      </div>
    </motion.div>
  )
}
