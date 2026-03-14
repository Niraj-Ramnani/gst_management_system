import clsx from 'clsx'
import { getStatusBadge } from '../../utils/formatters'

export default function StatusBadge({ status, className }) {
  const label = status?.replace(/_/g, ' ')
  return (
    <span className={clsx(
      getStatusBadge(status), 
      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-current transition-all",
      className
    )}>
      {label}
    </span>
  )
}
