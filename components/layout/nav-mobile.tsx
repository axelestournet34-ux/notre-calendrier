'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Home, Heart, Clock, MoreHorizontal,
  Calendar, Images, BarChart2,
  MapPin, PenLine, List, Star,
  Settings, X, HelpCircle, Music, Download, Archive, Sun
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { seDeconnecter } from '@/features/auth/actions'

const navPrincipal = [
  { href: '/dashboard',         label: 'Accueil',  icon: Home },
  { href: '/souvenirs/nouveau', label: 'Ajouter', icon: Heart },
  { href: '/timeline',          label: 'Timeline', icon: Clock },
]

const navPlus = [
  { href: '/aujourdhui',        label: 'Notre journée',     icon: Sun },
  { href: '/calendrier',        label: 'Calendrier',        icon: Calendar },
  { href: '/galerie',           label: 'Galerie photos',    icon: Images },
  { href: '/bilan',             label: 'Bilan annuel',      icon: BarChart2 },
  { href: '/mots-amour',        label: 'Mots d\'amour',     icon: PenLine },
  { href: '/lieux',             label: 'Nos lieux',         icon: MapPin },
  { href: '/bucket-list',       label: 'Bucket list',       icon: List },
  { href: '/capsules',          label: 'Capsules',          icon: Archive },
  { href: '/dates-importantes', label: 'Dates importantes', icon: Star },
  { href: '/quiz',              label: 'Quiz souvenirs',    icon: HelpCircle },
  { href: '/notre-chanson',     label: 'Notre chanson',     icon: Music },
  { href: '/parametres/profil', label: 'Paramètres',        icon: Settings },
  { href: '/installer',         label: 'Installer l\'app',  icon: Download },
]

export function NavMobile() {
  const pathname = usePathname()
  const [ouvert, setOuvert] = useState(false)

  useEffect(() => { setOuvert(false) }, [pathname])

  useEffect(() => {
    if (ouvert) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [ouvert])

  return (
    <>
      {/* Barre de navigation fixe en bas */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur border-t border-border print:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navPrincipal.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl',
                  'transition-all duration-150 active:scale-95',
                  isActive ? 'text-primary' : 'text-text-muted'
                )}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            )
          })}

          <button
            onClick={() => setOuvert(true)}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-xl',
              'transition-all duration-150 active:scale-95',
              ouvert ? 'text-primary' : 'text-text-muted'
            )}
          >
            <MoreHorizontal size={22} />
            <span className="text-[10px] font-medium leading-none">Plus</span>
          </button>
        </div>
      </nav>

      {/* Overlay */}
      {ouvert && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOuvert(false)}
        />
      )}

      {/* Tiroir "Plus" */}
      <div className={cn(
        'lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl shadow-2xl',
        'transition-transform duration-300 ease-out',
        ouvert ? 'translate-y-0' : 'translate-y-full'
      )}>
        {/* Poignée + titre */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="w-10 h-1 bg-border rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
          <p className="text-sm font-semibold text-text">Plus</p>
          <button onClick={() => setOuvert(false)} className="text-text-muted hover:text-text p-1">
            <X size={18} />
          </button>
        </div>

        {/* Grille de liens */}
        <div className="grid grid-cols-3 gap-2 px-4 pb-4">
          {navPlus.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-2 py-4 px-2 rounded-2xl text-center',
                  'transition-all duration-150 active:scale-95',
                  isActive
                    ? 'bg-primary-light text-primary'
                    : 'bg-surface-raised text-text-soft hover:text-text'
                )}
              >
                <Icon size={22} className={isActive ? 'text-primary' : 'text-text-muted'} />
                <span className="text-[11px] font-medium leading-tight">{label}</span>
              </Link>
            )
          })}
        </div>

        {/* Déconnexion */}
        <div className="px-4 pb-8 border-t border-border pt-3">
          <form action={seDeconnecter}>
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
