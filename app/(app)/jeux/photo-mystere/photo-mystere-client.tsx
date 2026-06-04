'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { RotateCcw, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { PhotoMemory } from './page'

const NB_QUESTIONS = 8
const NB_CHOIX = 4

// Points selon le niveau de révélation (0 = très flouté, 1 = moyen, 2 = révélé)
const POINTS_PAR_NIVEAU = [3, 2, 1] as const
const LABELS_NIVEAU = ['Très flouté', 'Un peu moins…', 'Révélé']
const BLUR_PAR_NIVEAU = ['blur(48px)', 'blur(10px)', 'blur(0px)']

function melangerTableau<T>(arr: T[]): T[] {
  const c = [...arr]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

type Question = {
  correct: PhotoMemory
  choix: PhotoMemory[]
}

function genererQuestions(memories: PhotoMemory[], nb: number): Question[] {
  const melangees = melangerTableau(memories)
  return melangees.slice(0, Math.min(nb, melangees.length)).map(correct => {
    const mauvaises = melangerTableau(memories.filter(m => m.id !== correct.id)).slice(0, NB_CHOIX - 1)
    return { correct, choix: melangerTableau([correct, ...mauvaises]) }
  })
}

export function PhotoMystereClient({ memories }: { memories: PhotoMemory[] }) {
  const [etat, setEtat] = useState<'accueil' | 'jeu' | 'fin'>('accueil')
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [niveau, setNiveau] = useState(0)
  const [reponse, setReponse] = useState<string | null>(null)

  const insuffisant = memories.length < NB_CHOIX

  const demarrer = useCallback(() => {
    setQuestions(genererQuestions(memories, NB_QUESTIONS))
    setIndex(0)
    setScore(0)
    setNiveau(0)
    setReponse(null)
    setEtat('jeu')
  }, [memories])

  function reveler() {
    if (niveau < 2) setNiveau(n => n + 1)
  }

  function repondre(choix: PhotoMemory) {
    if (reponse !== null) return
    setReponse(choix.id)
    if (choix.id === questions[index].correct.id) {
      setScore(s => s + POINTS_PAR_NIVEAU[niveau as 0 | 1 | 2])
    }
  }

  function suivante() {
    if (index + 1 >= questions.length) { setEtat('fin'); return }
    setIndex(i => i + 1)
    setNiveau(0)
    setReponse(null)
  }

  if (insuffisant) {
    return (
      <Card className="text-center py-12 space-y-3">
        <p className="text-sm font-semibold text-text">Pas assez de souvenirs</p>
        <p className="text-xs text-text-muted">Il faut au moins {NB_CHOIX} souvenirs avec photos.</p>
      </Card>
    )
  }

  if (etat === 'accueil') {
    return (
      <Card className="text-center py-12 space-y-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-none">
        <div className="text-5xl">🔍</div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-text">Photo mystère</p>
          <p className="text-sm text-text-muted">
            {Math.min(NB_QUESTIONS, memories.length)} rounds · La photo se révèle progressivement.
            Devinez vite pour avoir plus de points !
          </p>
        </div>
        <div className="flex justify-center gap-4 text-xs text-text-muted">
          <span>Très flouté = <strong className="text-primary">3 pts</strong></span>
          <span>Moins flouté = <strong className="text-primary">2 pts</strong></span>
          <span>Révélé = <strong className="text-primary">1 pt</strong></span>
        </div>
        <Button onClick={demarrer} size="lg" className="mx-auto">Commencer</Button>
      </Card>
    )
  }

  if (etat === 'fin') {
    const maxScore = questions.length * 3
    const pct = Math.round((score / maxScore) * 100)
    const message =
      pct === 100 ? 'Score parfait ! Vos yeux reconnaissent tout ♡'
      : pct >= 66  ? 'Excellent ! Vous avez l\'œil affûté ✨'
      : pct >= 33  ? 'Bien joué ! Avec de l\'entraînement vous serez imbattable 😊'
      : 'C\'est dur hein ? Chaque jeu est une occasion de se remémorer 🌹'

    return (
      <Card className="text-center py-12 space-y-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-none">
        <div className="text-5xl">🏆</div>
        <div className="space-y-1">
          <p className="text-4xl font-bold text-primary">{score} / {maxScore}</p>
          <p className="text-sm text-text-muted">{message}</p>
        </div>
        <div className="flex justify-center">
          <div className="h-2 w-48 rounded-full bg-border overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <Button onClick={demarrer} icon={<RotateCcw size={16} />} className="mx-auto">Rejouer</Button>
      </Card>
    )
  }

  const q = questions[index]
  if (!q) return null
  const pointsPossibles = POINTS_PAR_NIVEAU[niveau as 0 | 1 | 2]

  return (
    <div className="space-y-4">
      {/* Progression */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Round {index + 1} / {questions.length}
        </p>
        <p className="text-sm font-bold text-primary">{score} pt{score !== 1 ? 's' : ''}</p>
      </div>
      <div className="h-1 w-full rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>

      {/* Badge niveau + points possibles */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted bg-surface-raised px-2 py-1 rounded-full">
          {LABELS_NIVEAU[niveau]}
        </span>
        {reponse === null && (
          <span className="text-xs font-semibold text-primary">
            +{pointsPossibles} pt{pointsPossibles > 1 ? 's' : ''} si bonne réponse
          </span>
        )}
      </div>

      {/* Photo floutée */}
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-surface-raised shadow-md">
        <Image
          src={q.correct.photoUrl}
          alt="Photo mystère"
          fill
          className="object-cover transition-all duration-500"
          style={{ filter: reponse !== null ? 'blur(0px)' : BLUR_PAR_NIVEAU[niveau] }}
          sizes="(max-width: 640px) 100vw, 640px"
        />
        {reponse !== null && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-white text-sm font-semibold">{q.correct.title}</p>
            <p className="text-white/70 text-xs">{format(new Date(q.correct.date), 'd MMMM yyyy', { locale: fr })}</p>
          </div>
        )}
      </div>

      {/* Bouton révéler */}
      {reponse === null && niveau < 2 && (
        <button
          onClick={reveler}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
        >
          <Eye size={15} />
          Révéler la photo (−{pointsPossibles - POINTS_PAR_NIVEAU[(niveau + 1) as 1 | 2]} pt)
        </button>
      )}

      {/* Choix */}
      <Card className="space-y-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          C&apos;est quel souvenir ?
        </p>
        <div className="grid grid-cols-1 gap-2">
          {q.choix.map(choix => {
            const estChoisi = reponse === choix.id
            const estCorrect = choix.id === q.correct.id
            let style: string
            if (reponse === null) {
              style = 'bg-surface-raised hover:bg-primary-light hover:text-primary text-text-soft border border-border hover:border-primary/30'
            } else if (estCorrect) {
              style = 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            } else if (estChoisi) {
              style = 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
            } else {
              style = 'bg-surface-raised text-text-muted border border-border opacity-50'
            }
            return (
              <button
                key={choix.id}
                onClick={() => repondre(choix)}
                disabled={reponse !== null}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                  reponse === null && 'active:scale-[0.98]',
                  style
                )}
              >
                <span className="block truncate">{choix.title}</span>
                <span className="block text-xs opacity-70 mt-0.5">
                  {format(new Date(choix.date), 'd MMMM yyyy', { locale: fr })}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      {reponse !== null && (
        <Button onClick={suivante} className="w-full" size="lg">
          {index + 1 >= questions.length ? 'Voir le résultat' : 'Round suivant →'}
        </Button>
      )}
    </div>
  )
}
