'use client'

import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, iconLeft, iconRight, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-soft"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4 pointer-events-none">
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-11 rounded-xl border border-border bg-surface',
              'px-3.5 text-sm text-text placeholder:text-text-muted',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-400 focus:ring-red-300 focus:border-red-400',
              iconLeft && 'pl-10',
              iconRight && 'pr-10',
              className
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted size-4">
              {iconRight}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
