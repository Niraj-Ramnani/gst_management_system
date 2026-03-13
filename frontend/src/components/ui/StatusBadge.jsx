import clsx from 'clsx'
import { getStatusBadge } from '../../utils/formatters'

export default function StatusBadge({ status }) {
  const label = status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return <span className={clsx(getStatusBadge(status))}>{label}</span>
}
