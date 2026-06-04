'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { RotateCcw, Check, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { VraiFauxMemory } from './page'

const NB_QUESTIONS = 10

const SAISONS = [
  { label: 'en hiver',    mois: [12, 1, 2]  },
  { label: 'au printemps', mois: [3, 4, 5]  },
  { label: 'en été',      mois: [6, 7, 8]   },
  { label: 'en automne',  mois: [9, 10, 11] },
] as const

const TYPES_LABELS: Record<string, string> = {
  sortie:        'une sortie',
  voyage:        'un voyage',
  repas:         'un repas',
  anniversaire:  'un anniversaire',
  quotidien:     'un moment du quotidien',
  premiere_fois: 'une première fois',
  autre:         'un moment spécial',
}

type Affirmation = { texte: string; vrai: boolean }

function genererAffirmation(m: VraiFauxMemory, tous: VraiFauxMemory[]): Affirmation {
  const date = new Date(m.date)
  const mois = date.getMonth() + 1
  const annee = date.getFullYear()
  const jour = date.getDay()

  const generators: (() => Affirmation)[] = [
    // Saison
    () => {
      const saisonReelle = SAISONS.find(s => (s.mois as readonly number[]).includes(mois))!
      if (Math.random() < 0.5) return { texte: `"${m.title}" a eu lieu ${saisonReelle.label}`, vrai: true }
      const autres = SAISONS.filter(s => !(s.mois as readonly number[]).includes(mois))
      const fausse = autres[Math.floor(Math.random() * autres.length)]
      return { texte: `"${m.title}" a eu lieu ${fausse.label}`, vrai: false }
    },
    // Week-end
    () => {
      const estWE = jour === 0 || jour === 6
      if (Math.random() < 0.5) return { texte: `"${m.title}" a eu lieu un week-end`, vrai: estWE }
      return { texte: `"${m.title}" a eu lieu en semaine`, vrai: !estWE }
    },
    // Année
    () => {
      const autresAnnees = [...new Set(tous.map(x => new Date(x.date).getFullYear()).filter(y => y !== annee))]
      if (Math.random() < 0.5 || autresAnnees.length === 0)
        return { texte: `"${m.title}" date de ${annee}`, vrai: true }
      const fausseAnnee = autresAnnees[Math.floor(Math.random() * autresAnnees.length)]
      return { texte: `"${m.title}" date de ${fausseAnnee}`, vrai: false }
    },
    // Type
    () => {
      const autresTypes = [...new Set(tous.map(x => x.type).filter(t => t !== m.type))]
      if (Math.random() < 0.5 || autresTypes.length === 0)
        return { texte: `"${m.title}" était ${TYPES_LABELS[m.type] ?? 'un souvenir'}`, vrai: true }
      const fauxType = autresTypes[Math.floor(Math.random() * autresTypes.length)]
      return { texte: `"${m.title}" était ${TYPES_LABELS[fauxType] ?? 'un souvenir'}`, vrai: false }
    },
  ]

  // Lieu
  if (m.lieu) {
    const tousLieux = [...new Set(tous.map(x => x.lieu).filter(Boolean) as string[])]
    generators.push(() => {
      if (Math.random() < 0.5) return { texte: `"${m.title}" s'est passé à ${m.lieu}`, vrai: true }
      const autres = tousLieux.filter(l => l !== m.lieu)
      if (autres.length === 0) return { texte: `"${m.title}" s'est passé à ${m.lieu}`, vrai: true }
      const fauxLieu = autres[Math.floor(Math.random() * autres.length)]
      return { texte: `"${m.title}" s'est passé à ${fauxLieu}`, vrai: false }
    })
  }

  // Photos
  if (m.photoCount > 0) {
    generators.push(() => {
      const seuil = Math.random() < 0.5 ? 1 : Math.max(1, m.photoCount - 1)
      return {
        texte: `"${m.title}" contient au moins ${seuil} photo${seuil > 1 ? 's' : ''}`,
        vrai: m.photoCount >= seuil,
      }
    })
  }

  return generators[Math.floor(Math.random() * generators.length)]()
}

function melangerTableau<T>(arr: T[]): T[] {
  const c = [...arr]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

type Question = { memory: VraiFauxMemory; affirmation: Affirmation }

function genererQuestions(memories: VraiFauxMemory[], nb: number): Question[] {
  const melangees = melangerTableau(memories)
  return melangees.slice(0, Math.min(nb, melangees.length)).map(m => ({
    memory: m,
    affirmation: genererAffirmation(m, memories),
  }))
}

export function VraiFauxClient({ memories }: { memories: VraiFauxMemory[] }) {
  const [etat, setEtat] = useState<'accueil' | 'jeu' | 'fin'>('accueil')
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [reponse, setReponse] = useState<boolean | null>(null)

  const insuffisant = memories.length < 2

  const demarrer = useCallback(() => {
    setQuestions(genererQuestions(memories, NB_QUESTIONS))
    setIndex(0); setScore(0); setReponse(null); setEtat('jeu')
  }, [memories])

  function repondre(rep: boolean) {
    if (reponse !== null) return
    setReponse(rep)
    if (rep === questions[index].affirmation.vrai) setScore(s => s + 1)
  }

  function suivante() {
    if (index + 1 >= questions.length) { setEtat('fin'); return }
    setIndex(i => i + 1); setReponse(null)
  }

  if (insuffisant) {
    return (
      <Card className="text-center py-12 space-y-3">
        <p className="text-sm font-semibold text-text">Pas assez de souvenirs</p>
        <p className="text-xs text-text-muted">Il faut au moins 2 souvenirs pour jouer.</p>
      </Card>
    )
  }

  if (etat === 'accueil') {
    return (
      <Card className="text-center py-12 space-y-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-none">
        <div className="text-5xl">✅</div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-text">Vrai ou faux ?</p>
          <p className="text-sm text-text-muted">
            {Math.min(NB_QUESTIONS, memories.length)} affirmations sur vos vrais souvenirs.
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
      pct === 100 ? 'Parfait ! Vous connaissez vos souvenirs par cœur ♡'
      : pct >= 70  ? 'Très bien ! Vous êtes attentifs à votre histoire ✨'
      : pct >= 40  ? 'Pas mal ! Relisez vos souvenirs pour mieux les connaître 😊'
      : 'L\'important c\'est les souvenirs, pas les détails 🌹'
    return (
      <Card className="text-center py-12 space-y-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-none">
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
  const { memory: m, affirmation: aff } = q
  const correct = reponse !== null && reponse === aff.vrai

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

      {/* Photo + date */}
      {m.photoUrl && (
        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-surface-raised shadow-md">
          <Image src={m.photoUrl} alt={m.title} fill className="object-cover" sizes="(max-width:640px) 100vw, 640px" />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <p className="text-white/80 text-xs">{format(new Date(m.date), 'd MMMM yyyy', { locale: fr })}</p>
          </div>
        </div>
      )}

      {/* Affirmation */}
      <Card className={cn(
        'transition-colors duration-300',
        reponse !== null && (correct ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800')
      )}>
        <p className="text-base font-medium text-text text-center leading-relaxed">{aff.texte}</p>
        {reponse !== null && (
          <p className={cn('text-sm font-semibold text-center mt-2', correct ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
            {correct ? '✓ Correct !' : `✗ Faux — c'était ${aff.vrai ? 'vrai' : 'faux'}`}
          </p>
        )}
      </Card>

      {/* Boutons Vrai / Faux */}
      {reponse === null && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => repondre(true)}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 font-semibold text-lg hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors active:scale-95"
          >
            <Check size={22} /> Vrai
          </button>
          <button
            onClick={() => repondre(false)}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold text-lg hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors active:scale-95"
          >
            <X size={22} /> Faux
          </button>
        </div>
      )}

      {reponse !== null && (
        <Button onClick={suivante} className="w-full" size="lg">
          {index + 1 >= questions.length ? 'Voir le résultat' : 'Question suivante →'}
        </Button>
      )}
    </div>
  )
}
