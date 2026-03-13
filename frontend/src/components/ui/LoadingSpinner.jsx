import clsx from 'clsx'

export default function LoadingSpinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className={clsx('border-2 border-primary-600 border-t-transparent rounded-full animate-spin', sizes[size])} />
    </div>
  )
}
