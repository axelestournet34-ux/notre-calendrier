'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Heart, Images, MoreHorizontal } from 'lucide-react'
import { cn } from '@/utils/cn'

const navItems = [
  { href: '/dashboard',         label: 'Accueil',    icon: Home },
  { href: '/calendrier',        label: 'Calendrier', icon: Calendar },
  { href: '/souvenirs/nouveau', label: 'Souvenir',   icon: Heart },
  { href: '/galerie',           label: 'Galerie',    icon: Images },
  { href: '/timeline',          label: 'Plus',       icon: MoreHorizontal },
]

export function NavMobile() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur border-t border-border safe-area-inset-bottom print:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-0',
                'transition-all duration-150 active:scale-95',
                isActive ? 'text-primary' : 'text-text-muted'
              )}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
