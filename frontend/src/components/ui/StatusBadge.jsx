import clsx from 'clsx'
import { getStatusBadge } from '../../utils/formatters'
import { useTheme } from '../../context/ThemeContext'

export default function StatusBadge({ status, className }) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const label = status?.replace(/_/g, ' ')
  const badgeClass = getStatusBadge(status)
  const isInfo = badgeClass === 'badge-info'

  return (
    <span className={clsx(
      badgeClass, 
      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-current transition-all",
      isInfo && (isLight ? "text-white bg-primary-600 !border-primary-600" : "text-black bg-primary-500 !border-primary-500"),
      className
    )}>
      {label}
    </span>
  )
}
