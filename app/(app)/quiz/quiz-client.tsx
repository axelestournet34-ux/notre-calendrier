'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { HelpCircle, RotateCcw, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { QuizMemory } from './page'

const NB_QUESTIONS = 10
const NB_CHOIX = 4

interface QuizClientProps {
  memories: QuizMemory[]
}

type EtatJeu = 'accueil' | 'jeu' | 'fin'
type EtatReponse = 'attente' | 'correct' | 'incorrect'

function melangerTableau<T>(arr: T[]): T[] {
  const copie = [...arr]
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

function genererQuestions(memories: QuizMemory[], nb: number) {
  const melangees = melangerTableau(memories)
  const questions = melangees.slice(0, nb)
  return questions.map((correct) => {
    const mauvaises = melangerTableau(memories.filter((m) => m.id !== correct.id)).slice(0, NB_CHOIX - 1)
    const choix = melangerTableau([correct, ...mauvaises])
    return { correct, choix }
  })
}

export function QuizClient({ memories }: QuizClientProps) {
  const [etat, setEtat] = useState<EtatJeu>('accueil')
  const [questions, setQuestions] = useState<ReturnType<typeof genererQuestions>>([])
  const [indexQuestion, setIndexQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [etatReponse, setEtatReponse] = useState<EtatReponse>('attente')
  const [reponseChoisie, setReponseChoisie] = useState<string | null>(null)
  const [coeurAnime, setCoeurAnime] = useState(false)

  const insuffisant = memories.length < NB_CHOIX

  const demarrer = useCallback(() => {
    const nb = Math.min(NB_QUESTIONS, memories.length)
    setQuestions(genererQuestions(memories, nb))
    setIndexQuestion(0)
    setScore(0)
    setEtatReponse('attente')
    setReponseChoisie(null)
    setEtat('jeu')
  }, [memories])

  function repondre(choix: QuizMemory) {
    if (etatReponse !== 'attente') return
    const correct = questions[indexQuestion]?.correct
    if (!correct) return

    setReponseChoisie(choix.id)

    if (choix.id === correct.id) {
      setEtatReponse('correct')
      setScore((s) => s + 1)
      setCoeurAnime(true)
      setTimeout(() => setCoeurAnime(false), 600)
    } else {
      setEtatReponse('incorrect')
    }
  }

  function suivante() {
    const prochainIndex = indexQuestion + 1
    if (prochainIndex >= questions.length) {
      setEtat('fin')
    } else {
      setIndexQuestion(prochainIndex)
      setEtatReponse('attente')
      setReponseChoisie(null)
    }
  }

  if (insuffisant) {
    return (
      <Card className="text-center py-12 space-y-3">
        <div className="size-14 rounded-full bg-primary-light flex items-center justify-center text-2xl mx-auto">
          <HelpCircle size={28} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-text">Pas assez de souvenirs</p>
        <p className="text-xs text-text-muted">
          Il faut au moins {NB_CHOIX} souvenirs avec photos pour jouer.
        </p>
      </Card>
    )
  }

  if (etat === 'accueil') {
    return (
      <Card className="text-center py-12 space-y-4 bg-gradient-to-br from-primary-light via-rose-50 to-accent-light dark:from-primary-light dark:via-rose-950/20 dark:to-accent-light border-none">
        <div className="text-5xl">🎴</div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-text">Quiz souvenirs</p>
          <p className="text-sm text-text-muted">
            {Math.min(NB_QUESTIONS, memories.length)} questions · Reconnaissez-vous vos souvenirs ?
          </p>
        </div>
        <Button onClick={demarrer} size="lg" className="mx-auto">
          Commencer le quiz
        </Button>
      </Card>
    )
  }

  if (etat === 'fin') {
    const total = questions.length
    const pourcentage = Math.round((score / total) * 100)
    const message =
      pourcentage === 100
        ? 'Parfait ! Vous connaissez vos souvenirs sur le bout des doigts 💕'
        : pourcentage >= 70
        ? 'Très bien ! Votre mémoire est bien remplie de beaux moments ✨'
        : pourcentage >= 40
        ? 'Pas mal ! Peut-être que rejouer vous aidera à mieux vous souvenir 😊'
        : 'Courageux·se ! Il y a encore de beaux souvenirs à (re)découvrir 🌹'

    return (
      <Card className="text-center py-12 space-y-5 bg-gradient-to-br from-primary-light via-rose-50 to-accent-light dark:from-primary-light dark:via-rose-950/20 dark:to-accent-light border-none">
        <div className="text-5xl">🏆</div>
        <div className="space-y-1">
          <p className="text-4xl font-bold text-primary">{score} / {total}</p>
          <p className="text-sm text-text-muted">{message}</p>
        </div>
        <div className="flex items-center justify-center">
          <div className="h-2 w-48 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${pourcentage}%` }}
            />
          </div>
        </div>
        <Button onClick={demarrer} icon={<RotateCcw size={16} />} className="mx-auto">
          Rejouer
        </Button>
      </Card>
    )
  }

  const question = questions[indexQuestion]
  if (!question) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Question {indexQuestion + 1} / {questions.length}
        </p>
        <p className="text-sm font-bold text-primary">{score} pt{score !== 1 ? 's' : ''}</p>
      </div>

      <div className="h-1 w-full rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${((indexQuestion) / questions.length) * 100}%` }}
        />
      </div>

      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-surface-raised shadow-md">
        <Image
          src={question.correct.photoUrl ?? 'https://picsum.photos/id/1018/800/600'}
          alt="Photo du souvenir"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 640px"
        />
        {coeurAnime && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-6xl animate-ping opacity-80">💕</span>
          </div>
        )}
      </div>

      <Card className="space-y-1">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Dans quel souvenir ?
        </p>
        <div className="grid grid-cols-1 gap-2">
          {question.choix.map((choix) => {
            const estChoisi = reponseChoisie === choix.id
            const estCorrect = choix.id === question.correct.id
            let variante: string
            if (etatReponse === 'attente') {
              variante = 'bg-surface-raised hover:bg-primary-light hover:text-primary text-text-soft border border-border hover:border-primary/30'
            } else if (estCorrect) {
              variante = 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            } else if (estChoisi) {
              variante = 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
            } else {
              variante = 'bg-surface-raised text-text-muted border border-border opacity-50'
            }

            return (
              <button
                key={choix.id}
                onClick={() => repondre(choix)}
                disabled={etatReponse !== 'attente'}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                  etatReponse === 'attente' && 'active:scale-[0.98]',
                  variante
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

      {etatReponse !== 'attente' && (
        <Button onClick={suivante} className="w-full" size="lg">
          {indexQuestion + 1 >= questions.length ? 'Voir le résultat' : 'Question suivante →'}
        </Button>
      )}
    </div>
  )
}
