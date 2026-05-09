'use client'

import { useActionState, useState } from 'react'
import { format, parseISO, differenceInDays, addYears, isBefore } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus, Trash2, Star, Heart, Plane, Calendar } from 'lucide-react'
import { ajouterDate, supprimerDate } from './actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'

type DateImportante = {
  id: string; title: string; date: string
  type: string; recurrent: boolean; notes: string | null
}

const TYPES = [
  { value: 'anniversaire',      label: 'Anniversaire',      icon: Heart,    color: 'text-primary' },
  { value: 'premiere_rencontre',label: 'Première rencontre', icon: Star,     color: 'text-accent' },
  { value: 'voyage',            label: 'Voyage',            icon: Plane,    color: 'text-blue-500' },
  { value: 'personnalise',      label: 'Personnalisé',      icon: Calendar, color: 'text-purple-500' },
]

function prochaineDateOuCompte(date: string, recurrent: boolean): { jours: number; label: string } {
  const aujourd = new Date()
  const d = parseISO(date)

  if (recurrent) {
    let prochaine = new Date(aujourd.getFullYear(), d.getMonth(), d.getDate())
    if (isBefore(prochaine, aujourd)) prochaine = addYears(prochaine, 1)
    const jours = differenceInDays(prochaine, aujourd)
    return { jours, label: jours === 0 ? "Aujourd'hui !" : `dans ${jours} jour${jours > 1 ? 's' : ''}` }
  }

  const jours = differenceInDays(d, aujourd)
  if (jours < 0) return { jours, label: `il y a ${Math.abs(jours)} jours` }
  if (jours === 0) return { jours: 0, label: "Aujourd'hui !" }
  return { jours, label: `dans ${jours} jour${jours > 1 ? 's' : ''}` }
}

export function DatesImportantesClient({ dates }: { dates: DateImportante[] }) {
  const [showForm, setShowForm] = useState(false)
  const [typeChoisi, setTypeChoisi] = useState('anniversaire')
  const [state, action, pending] = useActionState(async (s: unknown, f: FormData) => {
    const res = await ajouterDate(s, f)
    if (res?.success) setShowForm(false)
    return res
  }, null)

  return (
    <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-5">

      {!showForm ? (
        <Button icon={<Plus size={16} />} onClick={() => setShowForm(true)} className="w-full">
          Ajouter une date
        </Button>
      ) : (
        <Card className="space-y-4">
          <p className="text-sm font-medium text-text">Nouvelle date importante</p>
          <form action={action} className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTypeChoisi(value)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-sm font-medium border transition-all',
                    typeChoisi === value
                      ? 'bg-primary-light border-primary text-primary'
                      : 'bg-surface border-border text-text-soft'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <input type="hidden" name="type" value={typeChoisi} />
            <Input label="Titre" name="titre" type="text" placeholder="Ex. Notre anniversaire..." required />
            <Input label="Date" name="date" type="date" required />
            <label className="flex items-center gap-2 text-sm text-text-soft cursor-pointer">
              <input type="checkbox" name="recurrent" className="rounded" />
              Se répète chaque année
            </label>
            <Input label="Note (optionnel)" name="notes" type="text" placeholder="Quelques mots..." />
            {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
            <div className="flex gap-2">
              <Button type="submit" loading={pending} size="sm">Ajouter</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </form>
        </Card>
      )}

      {dates.length === 0 && (
        <Card className="text-center py-12 space-y-3">
          <div className="size-14 rounded-full bg-accent-light flex items-center justify-center text-2xl mx-auto">⭐</div>
          <p className="text-sm text-text-muted">Aucune date importante pour l&apos;instant.</p>
        </Card>
      )}

      <div className="space-y-3">
        {dates.map((d) => {
          const type = TYPES.find((t) => t.value === d.type)
          const Icon = type?.icon ?? Calendar
          const { jours, label } = prochaineDateOuCompte(d.date, d.recurrent)

          return (
            <Card key={d.id} className="flex items-center gap-4">
              <div className={cn('size-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0', type?.color)}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">{d.title}</p>
                <p className="text-xs text-text-muted">
                  {format(parseISO(d.date), 'd MMMM' + (d.recurrent ? '' : ' yyyy'), { locale: fr })}
                  {d.recurrent && ' · chaque année'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={cn('text-sm font-semibold', jours === 0 ? 'text-primary' : jours < 0 ? 'text-text-muted' : 'text-accent')}>
                  {label}
                </p>
              </div>
              <button
                onClick={() => supprimerDate(d.id)}
                className="text-text-muted hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
