import clsx from 'clsx'

export default function LoadingSpinner({ size = 'md', className }) {
  const sizes = { 
    sm: 'w-5 h-5 border-2', 
    md: 'w-8 h-8 border-[3px]', 
    lg: 'w-12 h-12 border-4' 
  }
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className={clsx(
        'border-primary-500 border-t-white/10 rounded-full animate-spin', 
        sizes[size]
      )} />
    </div>
  )
}
