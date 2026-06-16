'use client'

import { useState, useActionState } from 'react'
import { Send, Check, X, Brain } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { creerQuestionTMC, repondreQuestionTMC } from '@/features/tu-me-connais/actions'

type ADeviner = { id: string; question: string; prenomAuteur: string; options: string[] }
type MonDefi = { id: string; question: string; bonneReponse: string; repondu: boolean; partenaireCorrect: boolean | null }
type Histo = { id: string; question: string; monChoix: string; bonneReponse: string; correct: boolean }

interface Props {
  aDeviner: ADeviner[]
  mesDefis: MonDefi[]
  historique: Histo[]
  score: { moi: number; partenaire: number }
}

const champInput =
  'w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'

function QuestionADeviner({ q }: { q: ADeviner }) {
  const [resultat, setResultat] = useState<{ correct: boolean; correctIndex: number } | null>(null)
  const [chosen, setChosen] = useState<number | null>(null)
  const [pending, setPending] = useState(false)

  async function repondre(i: number) {
    if (resultat || pending) return
    setChosen(i)
    setPending(true)
    const res = await repondreQuestionTMC(q.id, i)
    setPending(false)
    if ('error' in res) {
      toast.error(res.error)
      setChosen(null)
      return
    }
    setResultat(res)
    toast(res.correct ? 'Bravo, bonne réponse ! ✅' : 'Raté 😅')
  }

  return (
    <Card>
      <p className="text-xs text-text-muted mb-1">{q.prenomAuteur} te demande</p>
      <p className="font-medium text-text mb-3">{q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const estChoisi = chosen === i
          const estBonne = resultat && i === resultat.correctIndex
          return (
            <button
              key={i}
              onClick={() => repondre(i)}
              disabled={!!resultat || pending}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors disabled:cursor-default',
                resultat
                  ? estBonne
                    ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400'
                    : estChoisi
                      ? 'bg-red-50 border-red-300 text-red-600 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400'
                      : 'border-border text-text-muted'
                  : 'border-border text-text hover:border-primary/50 hover:bg-primary-light/30'
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {resultat && (
        <p className={cn('text-sm font-semibold mt-3', resultat.correct ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
          {resultat.correct ? '✓ Tu la connais bien !' : '✗ Pas tout à fait…'}
        </p>
      )}
    </Card>
  )
}

export function TuMeConnaisClient({ aDeviner, mesDefis, historique, score }: Props) {
  const [state, formAction, pending] = useActionState(creerQuestionTMC, null)

  return (
    <div className="space-y-6">
      {/* Score */}
      <Card className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20 border-none flex items-center justify-around text-center">
        <div>
          <p className="text-3xl font-bold text-primary">{score.moi}</p>
          <p className="text-xs text-text-muted">tes bonnes réponses</p>
        </div>
        <Brain className="text-primary/40" size={28} />
        <div>
          <p className="text-3xl font-bold text-accent">{score.partenaire}</p>
          <p className="text-xs text-text-muted">les siennes</p>
        </div>
      </Card>

      {/* À deviner */}
      {aDeviner.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-text">À toi de deviner ({aDeviner.length})</h2>
          {aDeviner.map((q) => <QuestionADeviner key={q.id} q={q} />)}
        </div>
      )}

      {/* Créer une question */}
      <Card className="space-y-3">
        <p className="text-sm font-semibold text-text">Pose une question sur toi 🧠</p>
        <form action={formAction} className="space-y-2">
          <input name="question" placeholder="Ex : Quel est mon plat préféré ?" maxLength={300} className={champInput} required />
          <input name="correct" placeholder="✅ La bonne réponse" maxLength={120} className={champInput} required />
          <input name="decoy1" placeholder="❌ Mauvaise réponse" maxLength={120} className={champInput} required />
          <input name="decoy2" placeholder="❌ Mauvaise réponse (optionnel)" maxLength={120} className={champInput} />
          <input name="decoy3" placeholder="❌ Mauvaise réponse (optionnel)" maxLength={120} className={champInput} />
          {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
          {state?.success && <p className="text-xs text-green-600 dark:text-green-400">Question envoyée ✨</p>}
          <Button type="submit" loading={pending} icon={<Send size={15} />}>Envoyer le défi</Button>
        </form>
      </Card>

      {/* Mes défis */}
      {mesDefis.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-text">Tes défis</h2>
          {mesDefis.map((d) => (
            <Card key={d.id} className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text">{d.question}</p>
                <p className="text-xs text-text-muted mt-0.5">Réponse : {d.bonneReponse}</p>
              </div>
              <span className="shrink-0 text-xs font-medium">
                {!d.repondu
                  ? <span className="text-text-muted">en attente…</span>
                  : d.partenaireCorrect
                    ? <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><Check size={14} /> trouvé</span>
                    : <span className="text-red-500 dark:text-red-400 flex items-center gap-1"><X size={14} /> raté</span>}
              </span>
            </Card>
          ))}
        </div>
      )}

      {/* Historique */}
      {historique.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-text">Tes réponses</h2>
          {historique.map((h) => (
            <Card key={h.id} className="space-y-0.5">
              <p className="text-sm text-text">{h.question}</p>
              <p className={cn('text-xs', h.correct ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
                {h.correct ? `✓ ${h.monChoix}` : `✗ ${h.monChoix} — c'était « ${h.bonneReponse} »`}
              </p>
            </Card>
          ))}
        </div>
      )}

      {aDeviner.length === 0 && mesDefis.length === 0 && historique.length === 0 && (
        <p className="text-sm text-text-muted text-center py-2">
          Lance le jeu en posant une première question sur toi 👆
        </p>
      )}
    </div>
  )
}
