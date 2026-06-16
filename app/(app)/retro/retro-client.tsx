'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, BarChart2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Stats {
  totalSouvenirs: number
  totalPhotos: number
  totalVideos: number
  moisMaxIdx: number
  moisMaxCount: number
  typeMax: string | null
  lieux: string[]
  joursEnsemble: number
  humeurMax: string | null
}

interface Props {
  annee: number
  coupleName: string
  anneePrecedente: number
  anneeSuivante: number | null
  stats: Stats
}

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const TYPE: Record<string, [string, string]> = {
  sortie: ['🎉', 'Les sorties'],
  voyage: ['✈️', 'Les voyages'],
  repas: ['🍽', 'Les repas'],
  anniversaire: ['🎂', 'Les anniversaires'],
  quotidien: ['☀️', 'Le quotidien'],
  premiere_fois: ['⭐', 'Les premières fois'],
  autre: ['♡', 'Les moments à deux'],
}

const MOOD: Record<string, [string, string]> = {
  heureux: ['😊', 'Heureux·se'],
  amoureux: ['🥰', 'Amoureux·se'],
  fatigue: ['😴', 'Fatigué·e'],
  stresse: ['😤', 'Stressé·e'],
  nostalgique: ['🥹', 'Nostalgique'],
  excite: ['🤩', 'Excité·e'],
}

const GRADIENTS = [
  'from-rose-400 to-pink-600',
  'from-violet-500 to-fuchsia-600',
  'from-amber-400 to-orange-600',
  'from-sky-400 to-blue-600',
  'from-emerald-400 to-teal-600',
  'from-fuchsia-500 to-rose-600',
  'from-indigo-500 to-purple-600',
]

type Carte = { emoji: string; grand: string | number; sous: string; petit?: string }

export function RetroClient({ annee, coupleName, anneePrecedente, anneeSuivante, stats }: Props) {
  const cartes: Carte[] = []
  cartes.push({ emoji: '✨', grand: annee, sous: 'Votre année en souvenirs', petit: coupleName })

  if (stats.totalSouvenirs > 0) {
    cartes.push({ emoji: '💞', grand: stats.totalSouvenirs, sous: `souvenir${stats.totalSouvenirs > 1 ? 's' : ''} créé${stats.totalSouvenirs > 1 ? 's' : ''} cette année` })
    if (stats.totalPhotos + stats.totalVideos > 0) {
      cartes.push({ emoji: '📷', grand: stats.totalPhotos, sous: `photo${stats.totalPhotos > 1 ? 's' : ''} immortalisée${stats.totalPhotos > 1 ? 's' : ''}`, petit: stats.totalVideos > 0 ? `et ${stats.totalVideos} vidéo${stats.totalVideos > 1 ? 's' : ''}` : undefined })
    }
    if (stats.moisMaxCount > 0) {
      cartes.push({ emoji: '🔥', grand: MOIS[stats.moisMaxIdx], sous: 'votre mois le plus intense', petit: `${stats.moisMaxCount} souvenir${stats.moisMaxCount > 1 ? 's' : ''}` })
    }
    if (stats.typeMax && TYPE[stats.typeMax]) {
      cartes.push({ emoji: TYPE[stats.typeMax][0], grand: TYPE[stats.typeMax][1], sous: 'votre type de moment préféré' })
    }
    if (stats.lieux.length > 0) {
      cartes.push({ emoji: '📍', grand: stats.lieux.length, sous: `lieu${stats.lieux.length > 1 ? 'x' : ''} visité${stats.lieux.length > 1 ? 's' : ''}`, petit: stats.lieux.slice(0, 4).join(' · ') })
    }
    if (stats.humeurMax && MOOD[stats.humeurMax]) {
      cartes.push({ emoji: MOOD[stats.humeurMax][0], grand: MOOD[stats.humeurMax][1], sous: 'votre humeur dominante' })
    }
    cartes.push({ emoji: '🗓', grand: stats.joursEnsemble, sous: 'jours ensemble cette année' })
  }

  const vide = stats.totalSouvenirs === 0
  const [i, setI] = useState(0)
  const total = cartes.length + 1 // + outro
  const estOutro = i === total - 1
  const grad = GRADIENTS[i % GRADIENTS.length]

  function suivant() { setI((v) => Math.min(v + 1, total - 1)) }
  function precedent() { setI((v) => Math.max(v - 1, 0)) }

  const carte = cartes[i]

  return (
    <div className="px-4 lg:px-6 py-6 max-w-xl mx-auto w-full">
      {/* Navigation années */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <Link href={`/retro?annee=${anneePrecedente}`} className="text-text-muted hover:text-text flex items-center gap-1">
          <ChevronLeft size={15} /> {anneePrecedente}
        </Link>
        <span className="font-semibold text-text">Rétro {annee}</span>
        {anneeSuivante ? (
          <Link href={`/retro?annee=${anneeSuivante}`} className="text-text-muted hover:text-text flex items-center gap-1">
            {anneeSuivante} <ChevronRight size={15} />
          </Link>
        ) : <span className="w-12" />}
      </div>

      {vide ? (
        <div className="min-h-[60vh] rounded-3xl bg-gradient-to-br from-rose-400 to-pink-600 flex flex-col items-center justify-center text-center px-6 text-white">
          <span className="text-6xl mb-4">🌱</span>
          <p className="text-xl font-bold">Pas encore de souvenirs en {annee}</p>
          <p className="text-white/80 mt-2 text-sm">Ajoutez vos premiers moments pour voir votre rétro prendre vie.</p>
        </div>
      ) : (
        <div
          onClick={estOutro ? undefined : suivant}
          className={cn(
            'relative min-h-[72vh] rounded-3xl overflow-hidden bg-gradient-to-br text-white select-none',
            !estOutro && 'cursor-pointer',
            grad
          )}
        >
          {/* Barre de progression */}
          <div className="absolute top-3 inset-x-3 flex gap-1 z-20">
            {Array.from({ length: total }).map((_, k) => (
              <div key={k} className={cn('h-1 flex-1 rounded-full transition-colors', k <= i ? 'bg-white/95' : 'bg-white/30')} />
            ))}
          </div>

          {/* Retour */}
          {i > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); precedent() }}
              className="absolute top-6 left-3 z-20 size-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
              aria-label="Précédent"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="min-h-[72vh] flex flex-col items-center justify-center text-center px-8"
            >
              {estOutro ? (
                <>
                  <span className="text-6xl mb-4">♡</span>
                  <p className="text-3xl font-bold leading-tight">Quelle belle année</p>
                  <p className="text-white/85 mt-3">Vivement la suite, tous les deux ✨</p>
                  <div className="mt-7 flex flex-col gap-2.5 w-full max-w-xs">
                    <Link
                      href={`/bilan/${annee}`}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-rose-600 font-medium text-sm"
                    >
                      <BarChart2 size={16} /> Voir le bilan détaillé
                    </Link>
                    <button
                      onClick={(e) => { e.stopPropagation(); setI(0) }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 font-medium text-sm"
                    >
                      <RotateCcw size={16} /> Revoir la rétro
                    </button>
                  </div>
                </>
              ) : carte ? (
                <>
                  <motion.span
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 12 }}
                    className="text-6xl mb-5"
                  >
                    {carte.emoji}
                  </motion.span>
                  <p className="text-5xl font-extrabold tracking-tight">{carte.grand}</p>
                  <p className="text-white/90 mt-3 text-lg leading-snug max-w-xs">{carte.sous}</p>
                  {carte.petit && <p className="text-white/70 mt-2 text-sm max-w-xs">{carte.petit}</p>}
                </>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* Indice tap */}
          {!estOutro && (
            <p className="absolute bottom-4 inset-x-0 text-center text-white/60 text-xs z-20">touche pour continuer →</p>
          )}
        </div>
      )}
    </div>
  )
}
