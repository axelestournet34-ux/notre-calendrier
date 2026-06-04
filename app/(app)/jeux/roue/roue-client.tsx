'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Shuffle, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { RoueMemory } from './page'

const DUREE_SPIN_MS = 2400
const INTERVALLE_DEBUT_MS = 60
const INTERVALLE_FIN_MS = 280

export function RoueClient({ memories }: { memories: RoueMemory[] }) {
  const [spinning, setSpinning] = useState(false)
  const [selection, setSelection] = useState<RoueMemory | null>(null)
  const [courant, setCourant] = useState<RoueMemory | null>(null)
  const [revealed, setRevealed] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef<number>(0)

  const arreter = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const choisi = memories[Math.floor(Math.random() * memories.length)]
    setCourant(choisi)
    setSelection(choisi)
    setSpinning(false)
    setTimeout(() => setRevealed(true), 100)
  }, [memories])

  const lancer = useCallback(() => {
    if (spinning || memories.length === 0) return
    setSelection(null)
    setRevealed(false)
    setSpinning(true)
    startRef.current = Date.now()

    let idx = Math.floor(Math.random() * memories.length)
    const cycler = () => {
      idx = (idx + 1) % memories.length
      setCourant(memories[idx])
      const elapsed = Date.now() - startRef.current
      const progress = Math.min(elapsed / DUREE_SPIN_MS, 1)
      // Ease out: slow down as we approach end
      const intervalle = INTERVALLE_DEBUT_MS + (INTERVALLE_FIN_MS - INTERVALLE_DEBUT_MS) * Math.pow(progress, 2)
      if (elapsed >= DUREE_SPIN_MS) { arreter(); return }
      intervalRef.current = setTimeout(cycler, intervalle)
    }
    intervalRef.current = setTimeout(cycler, INTERVALLE_DEBUT_MS)
  }, [spinning, memories, arreter])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  if (memories.length === 0) {
    return (
      <Card className="text-center py-12 space-y-3">
        <p className="text-sm font-semibold text-text">Aucun souvenir avec photo</p>
        <p className="text-xs text-text-muted">Ajoutez des photos à vos souvenirs pour les retrouver ici.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Zone de spin */}
      <div className="flex flex-col items-center gap-6">

        {/* Cercle animé */}
        <div className="relative size-56">
          {/* Anneau rotatif */}
          <div className={cn(
            'absolute inset-0 rounded-full border-4 border-primary/30',
            spinning && 'animate-spin border-t-primary'
          )} style={{ animationDuration: '0.8s' }} />
          <div className={cn(
            'absolute inset-2 rounded-full border-2 border-primary/20',
            spinning && 'animate-spin border-b-primary/60'
          )} style={{ animationDuration: '1.2s', animationDirection: 'reverse' }} />

          {/* Contenu central */}
          <div className="absolute inset-4 rounded-full bg-surface border border-border flex flex-col items-center justify-center p-3 text-center overflow-hidden">
            {!spinning && !selection && (
              <>
                <span className="text-3xl">♡</span>
                <p className="text-[10px] text-text-muted mt-1 leading-tight">
                  Appuyez pour découvrir un souvenir
                </p>
              </>
            )}
            {(spinning || (selection && !revealed)) && courant && (
              <p className="text-xs font-medium text-text leading-tight line-clamp-3">
                {courant.title}
              </p>
            )}
            {selection && revealed && (
              <p className="text-xs font-semibold text-primary leading-tight line-clamp-3 animate-pulse">
                {selection.title}
              </p>
            )}
          </div>
        </div>

        {/* Bouton */}
        <Button
          onClick={lancer}
          loading={spinning}
          icon={!spinning ? <Shuffle size={16} /> : undefined}
          size="lg"
          className="min-w-40"
        >
          {spinning ? 'En cours…' : selection ? 'Retourner' : 'Faire tourner'}
        </Button>
      </div>

      {/* Résultat */}
      {selection && revealed && (
        <div className={cn(
          'transition-all duration-500',
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <Link href={`/souvenirs/${selection.id}`}>
            <Card hover className="overflow-hidden p-0">
              <div className="relative aspect-video w-full">
                <Image
                  src={selection.photoUrl}
                  alt={selection.title}
                  fill
                  className="object-cover"
                  sizes="(max-width:640px) 100vw, 640px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <p className="text-white font-semibold text-lg leading-tight">{selection.title}</p>
                  <p className="text-white/70 text-sm mt-0.5">
                    {format(new Date(selection.date), 'd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-sm text-text-muted">Voir ce souvenir</p>
                <ArrowRight size={16} className="text-primary" />
              </div>
            </Card>
          </Link>
        </div>
      )}

      {/* Compteur */}
      {memories.length > 0 && (
        <p className="text-center text-xs text-text-muted">
          {memories.length} souvenir{memories.length > 1 ? 's' : ''} dans la roue
        </p>
      )}
    </div>
  )
}
