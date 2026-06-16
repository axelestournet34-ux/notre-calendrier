'use client'

import { useActionState } from 'react'
import { Send } from 'lucide-react'
import { repondreQuestion } from '@/features/questions/actions'
import { cn } from '@/utils/cn'

interface Props {
  question: string
  maReponse: string | null
  reponsePartenaire: string | null
  partenaireARepondu: boolean
  prenomPartenaire: string
}

export function QuestionDuJour({
  question, maReponse, reponsePartenaire, partenaireARepondu, prenomPartenaire,
}: Props) {
  const [state, formAction, pending] = useActionState(repondreQuestion, null)

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text">{question}</p>

      <form action={formAction} className="space-y-2">
        <textarea
          name="answer"
          rows={2}
          maxLength={1000}
          defaultValue={maReponse ?? ''}
          placeholder="Ta réponse..."
          className={cn(
            'w-full resize-none rounded-xl border border-border bg-surface px-3 py-2',
            'text-sm text-text placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'
          )}
        />
        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          <Send size={14} />
          {maReponse ? 'Mettre à jour' : 'Répondre'}
        </button>
      </form>

      {/* Réponse du partenaire — révélée seulement après avoir répondu */}
      {maReponse ? (
        reponsePartenaire ? (
          <div className="rounded-xl bg-gradient-to-br from-primary-light to-accent-light border border-primary/20 px-3 py-2.5">
            <p className="text-[10px] font-medium text-primary uppercase tracking-widest mb-1">{prenomPartenaire}</p>
            <p className="text-sm text-text">{reponsePartenaire}</p>
          </div>
        ) : (
          <p className="text-xs text-text-muted">En attente de la réponse de {prenomPartenaire}…</p>
        )
      ) : (
        partenaireARepondu && (
          <p className="text-xs text-text-muted">👀 {prenomPartenaire} a déjà répondu — réponds pour découvrir sa réponse !</p>
        )
      )}
    </div>
  )
}
