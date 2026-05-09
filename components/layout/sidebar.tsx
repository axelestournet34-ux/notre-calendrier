'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Home, Calendar, Heart, Images, Clock,
  List, Mail, Star, Settings, LogOut,
  BarChart2, MapPin, Sparkles, PenLine
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { seDeconnecter } from '@/features/auth/actions'
import type { Profile, Couple } from '@/types/app.types'

const navigation = [
  { href: '/dashboard',         label: 'Accueil',           icon: Home },
  { href: '/calendrier',        label: 'Calendrier',        icon: Calendar },
  { href: '/souvenirs/nouveau', label: 'Souvenirs',         icon: Heart },
  { href: '/galerie',           label: 'Galerie',           icon: Images },
  { href: '/timeline',          label: 'Timeline',          icon: Clock },
  { href: '/bilan',             label: 'Bilan',             icon: BarChart2 },
  { href: '/stats',             label: 'Stats',             icon: Sparkles },
  { href: '/lieux',             label: 'Lieux',             icon: MapPin },
  { href: '/mots-amour',        label: 'Mots d\'amour',     icon: PenLine },
  { href: '/lettre',            label: 'Lettres',           icon: Mail },
  { href: '/bucket-list',       label: 'Bucket list',       icon: List },
  { href: '/capsules',          label: 'Capsules',          icon: Mail },
  { href: '/dates-importantes', label: 'Dates importantes', icon: Star },
]

interface SidebarProps {
  profile: Profile | null
  couple: Couple | null
}

export function Sidebar({ profile, couple }: SidebarProps) {
  const rawPathname = usePathname()
  const [pathname, setPathname] = useState('')

  useEffect(() => {
    setPathname(rawPathname)
  }, [rawPathname])

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-border bg-surface px-3 py-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-2 mb-6">
        <div className="size-9 rounded-xl bg-primary-light flex items-center justify-center text-lg shrink-0">
          ♡
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text truncate">
            {couple?.name ?? 'Notre Calendrier'}
          </p>
          <p className="text-xs text-text-muted truncate">Espace privé</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {navigation.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-150',
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-text-soft hover:bg-surface-raised hover:text-text'
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'shrink-0',
                  isActive ? 'text-primary' : 'text-text-muted'
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bas : profil + settings + déconnexion */}
      <div className="space-y-0.5 pt-4 border-t border-border">
        <Link
          href="/parametres/profil"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
            'text-text-soft hover:bg-surface-raised hover:text-text transition-all duration-150',
            pathname.startsWith('/parametres') && 'bg-primary-light text-primary'
          )}
        >
          <Settings size={18} className="shrink-0 text-text-muted" />
          Paramètres
        </Link>

        <form action={seDeconnecter}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-soft hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all duration-150"
          >
            <LogOut size={18} className="shrink-0" />
            Se déconnecter
          </button>
        </form>

        {/* Avatar utilisateur */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2">
          <div className="size-8 rounded-full bg-primary-light flex items-center justify-center text-sm font-medium text-primary shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">
              {profile?.full_name ?? 'Vous'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
