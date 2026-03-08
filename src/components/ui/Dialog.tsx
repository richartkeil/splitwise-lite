import { cn } from '@/lib/utils'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  if (!open) return null

  return (
    <div
      className={cn(
        'fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center',
        open ? 'animate-in fade-in' : 'animate-out fade-out',
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          'glass-strong rounded-3xl shadow-fluent-lg max-w-md w-full mx-4 p-8',
          open ? 'animate-in zoom-in-95 fade-in' : 'animate-out zoom-out-95 fade-out',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-5">{title}</h2>
        {children}
      </div>
    </div>
  )
}
