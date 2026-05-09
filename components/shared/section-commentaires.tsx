'use client'

import { useActionState, useRef } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Trash2, Send } from 'lucide-react'
import { ajouterCommentaire, supprimerCommentaire } from '@/features/comments/actions'
import { cn } from '@/utils/cn'

type Commentaire = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { full_name: string | null }
}

interface Props {
  memoryId: string
  commentaires: Commentaire[]
  userId: string
}

export function SectionCommentaires({ memoryId, commentaires, userId }: Props) {
  const action = ajouterCommentaire.bind(null, memoryId)
  const [state, formAction, pending] = useActionState(action, null)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text">
        Commentaires {commentaires.length > 0 && `(${commentaires.length})`}
      </h3>

      {/* Liste */}
      {commentaires.length > 0 && (
        <div className="space-y-3">
          {commentaires.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <div className="size-7 rounded-full bg-primary-light flex items-center justify-center text-xs font-medium text-primary shrink-0 mt-0.5">
                {c.profiles?.full_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0 bg-surface-raised rounded-xl px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-text">
                    {c.profiles?.full_name ?? 'Vous'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted">
                      {format(parseISO(c.created_at), 'd MMM', { locale: fr })}
                    </span>
                    {c.user_id === userId && (
                      <button
                        onClick={() => supprimerCommentaire(c.id, memoryId)}
                        className="text-text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-text-soft mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire */}
      <form
        ref={formRef}
        action={async (fd) => {
          await formAction(fd)
          formRef.current?.reset()
        }}
        className="flex items-end gap-2"
      >
        <textarea
          name="content"
          rows={1}
          placeholder="Écrire un commentaire..."
          maxLength={500}
          className={cn(
            'flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2',
            'text-sm text-text placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              formRef.current?.requestSubmit()
            }
          }}
        />
        <button
          type="submit"
          disabled={pending}
          className="size-9 shrink-0 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}
