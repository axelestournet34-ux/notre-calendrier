'use client'

import { useTheme } from '@/components/providers/theme-provider'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/utils/cn'
import { NotificationBell } from '@/components/shared/notification-bell'

interface HeaderProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur border-b border-border px-4 lg:px-6 h-14 flex items-center justify-between gap-4">
      <div className="min-w-0">
        {title && (
          <h1 className="text-base font-semibold text-text truncate">{title}</h1>
        )}
        {subtitle && (
          <p className="text-xs text-text-muted truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actions}

        {/* Cloche de notifications */}
        <NotificationBell />

        {/* Toggle thème */}
        <div className="flex items-center rounded-lg border border-border bg-surface p-0.5 gap-0.5">
          {[
            { value: 'clair'   as const, icon: Sun,     label: 'Clair'   },
            { value: 'systeme' as const, icon: Monitor, label: 'Système' },
            { value: 'sombre'  as const, icon: Moon,    label: 'Sombre'  },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              title={label}
              className={cn(
                'p-1.5 rounded-md transition-all duration-150',
                theme === value
                  ? 'bg-primary-light text-primary'
                  : 'text-text-muted hover:text-text'
              )}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
