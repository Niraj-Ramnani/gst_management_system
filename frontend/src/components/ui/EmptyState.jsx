export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-slate-500" />
        </div>
      )}
      <p className="text-lg font-semibold text-slate-300">{title}</p>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
