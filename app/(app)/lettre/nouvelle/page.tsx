'use client'

import { useActionState } from 'react'
import { ecrireLettre } from '@/features/lettres/actions'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export default function NouvelleLetttrePage() {
  const [state, formAction, pending] = useActionState(ecrireLettre, null)

  return (
    <>
      <Header title="Écrire une lettre" subtitle="Un mot du cœur" />

      <div className="px-4 lg:px-6 py-6 max-w-xl mx-auto w-full">
        <form action={formAction} className="space-y-5">

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Titre</label>
            <input
              name="title"
              type="text"
              required
              placeholder="Pour toi..."
              className={cn(
                'w-full rounded-xl border border-border bg-surface px-3 py-2.5',
                'text-sm text-text placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Lettre</label>
            <textarea
              name="content"
              rows={14}
              required
              maxLength={10000}
              placeholder="Chère Fanny,&#10;&#10;..."
              className={cn(
                'w-full rounded-xl border border-border bg-surface px-4 py-3',
                'text-sm text-text placeholder:text-text-muted resize-none',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all',
                'font-serif leading-relaxed'
              )}
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}

          <Button type="submit" loading={pending} className="w-full">
            Envoyer la lettre 💌
          </Button>
        </form>
      </div>
    </>
  )
}
