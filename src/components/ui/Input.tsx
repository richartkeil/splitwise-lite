import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, id, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-semibold text-gray-600 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-xl bg-white/60 border border-white/50 px-4 py-2.5 text-sm shadow-sm backdrop-blur-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 focus:outline-none focus:bg-white/80 transition-all placeholder:text-gray-400',
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)

Input.displayName = 'Input'
