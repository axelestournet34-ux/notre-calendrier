import { cn } from '@/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  noPadding?: boolean
}

export function Card({ hover, noPadding, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl border border-border',
        'shadow-sm',
        !noPadding && 'p-5',
        hover && 'transition-all duration-200 hover:shadow hover:border-primary/30 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  )
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 className={cn('text-base font-semibold text-text', className)} {...props}>
      {children}
    </h3>
  )
}
