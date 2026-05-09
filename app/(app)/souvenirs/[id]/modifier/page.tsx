'use client'

import { useActionState } from 'react'
import { notFound } from 'next/navigation'
import { use } from 'react'
import { modifierSouvenir } from '@/features/memories/actions'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import type { MemoryType } from '@/types/database.types'

const TYPES: { value: MemoryType; label: string; emoji: string }[] = [
  { value: 'sortie',        label: 'Sortie',        emoji: '🎉' },
  { value: 'voyage',        label: 'Voyage',        emoji: '✈️' },
  { value: 'repas',         label: 'Repas',         emoji: '🍽' },
  { value: 'anniversaire',  label: 'Anniversaire',  emoji: '🎂' },
  { value: 'quotidien',     label: 'Quotidien',     emoji: '☀️' },
  { value: 'premiere_fois', label: 'Première fois', emoji: '⭐' },
  { value: 'autre',         label: 'Autre',         emoji: '♡' },
]

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    titre?: string
    date?: string
    type?: string
    note?: string
  }>
}

export default function ModifierSouvenirPage({ params, searchParams }: Props) {
  const { id } = use(params)
  const sp = use(searchParams)

  const action = modifierSouvenir.bind(null, id)
  const [state, formAction, pending] = useActionState(action, null)

  const typeInitial = (sp.type as MemoryType) ?? 'autre'

  return (
    <>
      <Header title="Modifier le souvenir" subtitle="Apportez vos corrections" />
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full">
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Type de souvenir</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all',
                    value === typeInitial
                      ? 'bg-primary-light border-primary text-primary'
                      : 'bg-surface border-border text-text-soft'
                  )}
                >
                  <span>{emoji}</span>{label}
                </button>
              ))}
            </div>
            <input type="hidden" name="type" defaultValue={typeInitial} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Titre" name="titre" type="text" defaultValue={sp.titre ?? ''} required />
            <Input label="Date" name="date" type="date" defaultValue={sp.date ?? ''} required />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Note (optionnel)</label>
            <textarea
              name="note"
              rows={4}
              defaultValue={sp.note ?? ''}
              className={cn(
                'w-full rounded-xl border border-border bg-surface px-3 py-2.5',
                'text-sm text-text placeholder:text-text-muted resize-none',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'
              )}
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}

          <Button type="submit" loading={pending} className="w-full">
            Enregistrer les modifications
          </Button>
        </form>
      </div>
    </>
  )
}
