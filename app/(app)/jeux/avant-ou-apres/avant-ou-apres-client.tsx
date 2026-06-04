'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { AvantMemory } from './page'

const NB_QUESTIONS = 10

function melangerTableau<T>(arr: T[]): T[] {
  const c = [...arr]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

type Question = { a: AvantMemory; b: AvantMemory; ancienId: string }

function genererQuestions(memories: AvantMemory[], nb: number): Question[] {
  const melangees = melangerTableau(memories)
  const questions: Question[] = []
  for (let i = 0; i < Math.min(nb, Math.floor(melangees.length / 2)); i++) {
    const a = melangees[i * 2]
    const b = melangees[i * 2 + 1]
    questions.push({ a, b, ancienId: a.date < b.date ? a.id : b.id })
  }
  return questions
}

export function AvantOuApresClient({ memories }: { memories: AvantMemory[] }) {
  const [etat, setEtat] = useState<'accueil' | 'jeu' | 'fin'>('accueil')
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [reponse, setReponse] = useState<string | null>(null)

  const insuffisant = memories.length < 2

  const demarrer = useCallback(() => {
    setQuestions(genererQuestions(memories, NB_QUESTIONS))
    setIndex(0); setScore(0); setReponse(null); setEtat('jeu')
  }, [memories])

  function repondre(id: string) {
    if (reponse !== null) return
    setReponse(id)
    if (id === questions[index].ancienId) setScore(s => s + 1)
  }

  function suivante() {
    if (index + 1 >= questions.length) { setEtat('fin'); return }
    setIndex(i => i + 1); setReponse(null)
  }

  if (insuffisant) {
    return (
      <Card className="text-center py-12 space-y-3">
        <p className="text-sm font-semibold text-text">Pas assez de souvenirs</p>
        <p className="text-xs text-text-muted">Il faut au moins 2 souvenirs avec photos.</p>
      </Card>
    )
  }

  if (etat === 'accueil') {
    return (
      <Card className="text-center py-12 space-y-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 border-none">
        <div className="text-5xl">⏳</div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-text">Avant ou après ?</p>
          <p className="text-sm text-text-muted">
            {Math.min(NB_QUESTIONS, Math.floor(memories.length / 2))} questions · Lequel des deux souvenirs est le plus ancien ?
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
      pct === 100 ? 'Mémoire chronologique parfaite ♡'
      : pct >= 70  ? 'Très bon sens du temps ✨'
      : pct >= 40  ? 'Pas mal ! Le temps passe vite 😊'
      : 'Le temps est un peu flou, et c\'est plutôt romantique 🌹'
    return (
      <Card className="text-center py-12 space-y-5 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 border-none">
        <div className="text-5xl">🏆</div>
        <p className="text-4xl font-bold text-primary">{score} / {total}</p>
        <p className="text-sm text-text-muted">{message}</p>
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

  const renderCard = (m: AvantMemory) => {
    const estChoisi = reponse === m.id
    const estAncien = m.id === q.ancienId
    let ring = ''
    if (reponse !== null) {
      ring = estAncien
        ? 'ring-2 ring-green-400 dark:ring-green-600'
        : estChoisi
        ? 'ring-2 ring-red-400 dark:ring-red-600'
        : 'opacity-50'
    }

    return (
      <button
        key={m.id}
        onClick={() => repondre(m.id)}
        disabled={reponse !== null}
        className={cn(
          'flex-1 rounded-2xl overflow-hidden text-left transition-all duration-200',
          reponse === null && 'hover:scale-[1.02] active:scale-[0.98]',
          ring
        )}
      >
        <div className="relative aspect-square w-full bg-surface-raised">
          <Image src={m.photoUrl} alt={m.title} fill className="object-cover" sizes="50vw" />
          {reponse !== null && estAncien && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              ← Plus ancien
            </div>
          )}
        </div>
        <div className="p-2 bg-surface border-t border-border">
          <p className="text-xs font-semibold text-text truncate">{m.title}</p>
          {reponse !== null && (
            <p className="text-[10px] text-text-muted mt-0.5">
              {format(new Date(m.date), 'd MMMM yyyy', { locale: fr })}
            </p>
          )}
        </div>
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Question {index + 1} / {questions.length}
        </p>
        <p className="text-sm font-bold text-primary">{score} pt{score !== 1 ? 's' : ''}</p>
      </div>
      <div className="h-1 w-full rounded-full bg-border overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>

      <p className="text-sm font-semibold text-text text-center">Cliquez sur le souvenir le plus <span className="text-primary">ancien</span></p>

      <div className="flex gap-3">
        {renderCard(q.a)}
        {renderCard(q.b)}
      </div>

      {reponse !== null && (
        <Button onClick={suivante} className="w-full" size="lg">
          {index + 1 >= questions.length ? 'Voir le résultat' : 'Question suivante →'}
        </Button>
      )}
    </div>
  )
}
