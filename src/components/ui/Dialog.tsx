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
        'fixed inset-0 bg-black/50 z-50 flex items-center justify-center',
        open ? 'animate-in fade-in' : 'animate-out fade-out',
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6',
          open ? 'animate-in zoom-in-95 fade-in' : 'animate-out zoom-out-95 fade-out',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  )
}
