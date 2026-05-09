'use client'

import { useActionState, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus, Trash2, Check, Circle, Clock } from 'lucide-react'
import { ajouterItem, changerStatut, supprimerItem } from './actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import type { BucketStatus } from '@/types/database.types'

type Item = {
  id: string; title: string; description: string | null
  status: BucketStatus; planned_date: string | null
  created_by: string; created_at: string
}

const STATUTS: { value: BucketStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'a_faire',  label: 'À faire',   icon: <Circle size={14} />,  color: 'text-text-muted' },
  { value: 'en_cours', label: 'En cours',  icon: <Clock size={14} />,   color: 'text-accent' },
  { value: 'realise',  label: 'Réalisé',   icon: <Check size={14} />,   color: 'text-green-500' },
]

export function BucketListClient({ items, userId }: { items: Item[]; userId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [state, action, pending] = useActionState(async (s: unknown, f: FormData) => {
    const res = await ajouterItem(s, f)
    if (res?.success) setShowForm(false)
    return res
  }, null)

  const aFaire  = items.filter((i) => i.status === 'a_faire')
  const enCours = items.filter((i) => i.status === 'en_cours')
  const realise = items.filter((i) => i.status === 'realise')

  return (
    <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-6">

      {/* Bouton ajouter */}
      {!showForm ? (
        <Button icon={<Plus size={16} />} onClick={() => setShowForm(true)} className="w-full">
          Ajouter une idée
        </Button>
      ) : (
        <Card className="space-y-4">
          <p className="text-sm font-medium text-text">Nouvelle idée</p>
          <form action={action} className="space-y-3">
            <Input label="Idée" name="titre" type="text" placeholder="Ex. Voyage à Lisbonne..." required />
            <Input label="Description (optionnel)" name="description" type="text" placeholder="Quelques détails..." />
            <Input label="Date prévue (optionnel)" name="plannedDate" type="date" />
            {state?.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit" loading={pending} size="sm">Ajouter</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </form>
        </Card>
      )}

      {/* État vide */}
      {items.length === 0 && (
        <Card className="text-center py-12 space-y-3">
          <div className="size-14 rounded-full bg-primary-light flex items-center justify-center text-2xl mx-auto">✨</div>
          <p className="text-sm text-text-muted">Aucune idée pour l&apos;instant. Ajoutez vos rêves à réaliser !</p>
        </Card>
      )}

      {/* Sections */}
      {[
        { label: 'À faire', items: aFaire, statut: 'a_faire' as BucketStatus },
        { label: 'En cours', items: enCours, statut: 'en_cours' as BucketStatus },
        { label: 'Réalisé 🎉', items: realise, statut: 'realise' as BucketStatus },
      ].filter(({ items }) => items.length > 0).map(({ label, items }) => (
        <div key={label} className="space-y-2">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <Card key={item.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                    {STATUTS.filter((s) => s.value !== item.status).map((s) => (
                      <button
                        key={s.value}
                        onClick={() => changerStatut(item.id, s.value)}
                        title={s.label}
                        className={cn('transition-colors hover:opacity-80', s.color)}
                      >
                        {s.icon}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-medium text-text', item.status === 'realise' && 'line-through text-text-muted')}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-text-muted mt-0.5">{item.description}</p>
                    )}
                    {item.planned_date && (
                      <p className="text-xs text-accent mt-1">
                        Prévu : {format(parseISO(item.planned_date), 'd MMM yyyy', { locale: fr })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => supprimerItem(item.id)}
                    className="text-text-muted hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
