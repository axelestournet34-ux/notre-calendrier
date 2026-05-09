'use client'

import { useActionState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { ecrireMessage, supprimerMessage } from '@/features/messages/actions'
import { cn } from '@/utils/cn'

interface Props {
  messagePartenaire: { id: string; content: string; prenomAuteur: string } | null
  monMessage: { id: string; content: string } | null
}

export function MessageDuJour({ messagePartenaire, monMessage }: Props) {
  const [state, formAction, pending] = useActionState(ecrireMessage, null)

  return (
    <div className="space-y-3">

      {/* Message du/de la partenaire */}
      {messagePartenaire && (
        <div className="relative bg-gradient-to-br from-primary-light to-accent-light rounded-2xl px-4 py-4 border border-primary/20">
          <p className="text-[10px] font-medium text-primary uppercase tracking-widest mb-2">
            💌 {messagePartenaire.prenomAuteur} vous écrit
          </p>
          <p className="text-sm text-text leading-relaxed italic">
            « {messagePartenaire.content} »
          </p>
        </div>
      )}

      {/* Mon message */}
      {monMessage ? (
        <div className="flex items-start gap-3 px-3 py-3 bg-surface-raised rounded-xl border border-border">
          <p className="flex-1 text-sm text-text-soft italic truncate">
            ✓ Votre message du jour envoyé
          </p>
          <button
            onClick={() => supprimerMessage(monMessage.id)}
            className="text-text-muted hover:text-red-500 transition-colors shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <form action={formAction} className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-[11px] text-text-muted">Votre message du jour</label>
            <textarea
              name="content"
              rows={2}
              maxLength={500}
              placeholder="Écrivez quelque chose de doux..."
              className={cn(
                'w-full resize-none rounded-xl border border-border bg-surface px-3 py-2',
                'text-sm text-text placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'
              )}
            />
            {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="mb-0.5 size-9 shrink-0 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            <Send size={15} />
          </button>
        </form>
      )}
    </div>
  )
}
