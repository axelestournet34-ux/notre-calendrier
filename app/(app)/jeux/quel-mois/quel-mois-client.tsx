'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { RotateCcw, CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { MoisMemory } from './page'

const NB_QUESTIONS = 10
const NB_CHOIX = 4

function melangerTableau<T>(arr: T[]): T[] {
  const c = [...arr]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

function formatMois(moisStr: string) {
  const [y, m] = moisStr.split('-')
  return format(new Date(Number(y), Number(m) - 1, 1), 'MMMM yyyy', { locale: fr })
}

type Question = {
  memory: MoisMemory
  correctMois: string
  choix: string[]
}

function genererQuestions(memories: MoisMemory[], nb: number): Question[] {
  const melangees = melangerTableau(memories)
  const pool = melangees.slice(0, Math.min(nb, melangees.length))
  const tousMois = [...new Set(memories.map(m => m.date.slice(0, 7)))]

  return pool.map(memory => {
    const correctMois = memory.date.slice(0, 7)
    const autresMois = melangerTableau(tousMois.filter(m => m !== correctMois))
    let mauvaisMois = autresMois.slice(0, NB_CHOIX - 1)

    // Compléter avec des mois générés si pas assez de vrais mois
    if (mauvaisMois.length < NB_CHOIX - 1) {
      const [y, mo] = correctMois.split('-').map(Number)
      for (let delta = 1; mauvaisMois.length < NB_CHOIX - 1; delta++) {
        const d = new Date(y, mo - 1 + delta, 1)
        const cle = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (cle !== correctMois && !mauvaisMois.includes(cle)) mauvaisMois.push(cle)
      }
    }

    return {
      memory,
      correctMois,
      choix: melangerTableau([correctMois, ...mauvaisMois]),
    }
  })
}

export function QuelMoisClient({ memories }: { memories: MoisMemory[] }) {
  const [etat, setEtat] = useState<'accueil' | 'jeu' | 'fin'>('accueil')
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [reponse, setReponse] = useState<string | null>(null)

  const insuffisant = memories.length < NB_CHOIX

  const demarrer = useCallback(() => {
    setQuestions(genererQuestions(memories, NB_QUESTIONS))
    setIndex(0)
    setScore(0)
    setReponse(null)
    setEtat('jeu')
  }, [memories])

  function repondre(choix: string) {
    if (reponse !== null) return
    setReponse(choix)
    if (choix === questions[index].correctMois) setScore(s => s + 1)
  }

  function suivante() {
    if (index + 1 >= questions.length) { setEtat('fin'); return }
    setIndex(i => i + 1)
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
      <Card className="text-center py-12 space-y-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-none">
        <div className="text-5xl">📅</div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-text">Quel mois était-ce ?</p>
          <p className="text-sm text-text-muted">
            {Math.min(NB_QUESTIONS, memories.length)} questions · La photo + le titre sont visibles, mais en quel mois ?
          </p>
        </div>
        <Button onClick={demarrer} size="lg" className="mx-auto">Commencer</Button>
      </Card>
    )
  }

  if (etat === 'fin') {
    const total = questions.length
    const pct = Math.round((score / total) * 100)
    const message =
      pct === 100 ? 'Mémoire parfaite ! Vous vous rappelez de tout ♡'
      : pct >= 70  ? 'Très bonne mémoire ! Vous connaissez bien votre histoire ✨'
      : pct >= 40  ? 'Pas mal ! Continuez à revivre vos souvenirs 😊'
      : 'Il y a encore de beaux moments à redécouvrir 🌹'

    return (
      <Card className="text-center py-12 space-y-5 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-none">
        <div className="text-5xl">🏆</div>
        <div className="space-y-1">
          <p className="text-4xl font-bold text-primary">{score} / {total}</p>
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

  return (
    <div className="space-y-4">
      {/* Progression */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Question {index + 1} / {questions.length}
        </p>
        <p className="text-sm font-bold text-primary">{score} pt{score !== 1 ? 's' : ''}</p>
      </div>
      <div className="h-1 w-full rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>

      {/* Photo */}
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-surface-raised shadow-md">
        <Image
          src={q.memory.photoUrl}
          alt={q.memory.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 640px"
        />
      </div>

      {/* Titre du souvenir (visible) */}
      <Card className="flex items-center gap-3 py-3">
        <CalendarDays size={16} className="text-primary shrink-0" />
        <p className="text-sm font-semibold text-text">{q.memory.title}</p>
      </Card>

      {/* Choix de mois */}
      <Card className="space-y-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          En quel mois ?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {q.choix.map((mois) => {
            const estChoisi = reponse === mois
            const estCorrect = mois === q.correctMois
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
                key={mois}
                onClick={() => repondre(mois)}
                disabled={reponse !== null}
                className={cn(
                  'px-4 py-3 rounded-xl text-sm font-medium text-center transition-all duration-150 capitalize',
                  reponse === null && 'active:scale-[0.98]',
                  style
                )}
              >
                {formatMois(mois)}
              </button>
            )
          })}
        </div>
      </Card>

      {reponse !== null && (
        <Button onClick={suivante} className="w-full" size="lg">
          {index + 1 >= questions.length ? 'Voir le résultat' : 'Question suivante →'}
        </Button>
      )}
    </div>
  )
}
