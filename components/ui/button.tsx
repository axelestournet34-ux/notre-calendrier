'use client'

import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconEnd?: React.ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow active:scale-[0.98]',
  secondary:
    'bg-primary-light text-primary hover:bg-rose-100 dark:hover:bg-primary-light',
  ghost:
    'text-text-soft hover:bg-surface-raised hover:text-text',
  danger:
    'bg-red-500 text-white hover:bg-red-600 shadow-sm active:scale-[0.98]',
  accent:
    'bg-accent text-white hover:bg-amber-600 shadow-sm active:scale-[0.98]',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconEnd,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-xl',
          'transition-all duration-150 ease-out',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin size-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : icon ? (
          <span className="shrink-0 size-4">{icon}</span>
        ) : null}
        {children}
        {!loading && iconEnd && (
          <span className="shrink-0 size-4">{iconEnd}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
