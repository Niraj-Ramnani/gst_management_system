import clsx from 'clsx'

export default function Skeleton({ className, circle }) {
  return (
    <div 
      className={clsx(
        "skeleton",
        circle ? "rounded-full" : "rounded-xl",
        className
      )}
    />
  )
}

export function KpiSkeleton() {
  return (
    <div className="card p-6 flex flex-col gap-5">
      <div className="flex justify-between">
        <Skeleton className="w-12 h-12" />
        <Skeleton className="w-16 h-6" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-32 h-8" />
      </div>
      <Skeleton className="w-40 h-3 mt-2" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="w-12 h-12 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-1/3 h-4" />
            <Skeleton className="w-1/4 h-3" />
          </div>
          <Skeleton className="w-24 h-8" />
        </div>
      ))}
    </div>
  )
}
