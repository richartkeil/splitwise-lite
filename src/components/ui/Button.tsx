import { cn } from '@/lib/utils'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-b from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-md shadow-primary-500/25 active:shadow-sm',
  secondary:
    'glass text-gray-700 hover:bg-white/80 shadow-sm active:shadow-none',
  danger:
    'bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/25 active:shadow-sm',
  ghost:
    'bg-transparent hover:bg-white/50 text-gray-600',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-xl font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:ring-offset-2 disabled:opacity-50 active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}
