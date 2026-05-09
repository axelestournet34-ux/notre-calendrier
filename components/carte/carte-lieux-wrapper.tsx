'use client'

import dynamic from 'next/dynamic'

const CarteLieux = dynamic(
  () => import('./carte-lieux').then(m => m.CarteLieux),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-2xl bg-surface-raised border border-border flex items-center justify-center">
        <p className="text-sm text-text-muted animate-pulse">Chargement de la carte…</p>
      </div>
    ),
  }
)

interface Lieu { nom: string; count: number }

export function CarteLieuxWrapper({ lieux }: { lieux: Lieu[] }) {
  return <CarteLieux lieux={lieux} />
}
