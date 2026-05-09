'use client'

import { useActionState, useState } from 'react'
import { format, parseISO, isPast, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus, Lock, Unlock, Mail } from 'lucide-react'
import { ajouterCapsule, ouvrirCapsule } from './actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'

type Capsule = {
  id: string; title: string; content: string
  open_date: string; opened_at: string | null
  created_by: string; created_at: string
  profiles: { full_name: string | null }
}

export function CapsulesClient({ capsules, userId }: { capsules: Capsule[]; userId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [capsuleOuverte, setCapsuleOuverte] = useState<string | null>(null)
  const [state, action, pending] = useActionState(async (s: unknown, f: FormData) => {
    const res = await ajouterCapsule(s, f)
    if (res?.success) setShowForm(false)
    return res
  }, null)

  const demain = new Date()
  demain.setDate(demain.getDate() + 1)
  const demainStr = format(demain, 'yyyy-MM-dd')

  return (
    <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-5">

      {!showForm ? (
        <Button icon={<Plus size={16} />} onClick={() => setShowForm(true)} className="w-full">
          Écrire une capsule
        </Button>
      ) : (
        <Card className="space-y-4">
          <p className="text-sm font-medium text-text">Nouvelle capsule temporelle</p>
          <form action={action} className="space-y-3">
            <Input label="Titre" name="titre" type="text" placeholder="Un message pour plus tard..." required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text">Message</label>
              <textarea
                name="contenu"
                rows={5}
                placeholder="Écrivez ce que vous voulez vous rappeler, ou dire à l'avenir..."
                required
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
              />
            </div>
            <Input label="Date d'ouverture" name="dateOuverture" type="date" min={demainStr} required />
            {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
            <div className="flex gap-2">
              <Button type="submit" loading={pending} size="sm">Sceller la capsule</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </form>
        </Card>
      )}

      {capsules.length === 0 && (
        <Card className="text-center py-12 space-y-3">
          <div className="size-14 rounded-full bg-primary-light flex items-center justify-center text-2xl mx-auto">
            <Mail size={24} className="text-primary" />
          </div>
          <p className="text-sm text-text-muted">Aucune capsule pour l&apos;instant.<br />Écrivez un message à ouvrir plus tard.</p>
        </Card>
      )}

      <div className="space-y-3">
        {capsules.map((c) => {
          const peutOuvrir = isPast(parseISO(c.open_date))
          const dejaOuverte = !!c.opened_at
          const joursRestants = differenceInDays(parseISO(c.open_date), new Date())
          const estOuverte = capsuleOuverte === c.id

          return (
            <Card key={c.id} className={cn('space-y-3', dejaOuverte && 'bg-accent-light/30 border-accent/20')}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  'size-10 rounded-xl flex items-center justify-center shrink-0',
                  dejaOuverte ? 'bg-accent-light text-accent' : peutOuvrir ? 'bg-primary-light text-primary' : 'bg-surface-raised text-text-muted'
                )}>
                  {dejaOuverte ? <Unlock size={18} /> : <Lock size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text">{c.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Par {c.profiles?.full_name ?? 'vous'} · à ouvrir le {format(parseISO(c.open_date), 'd MMMM yyyy', { locale: fr })}
                  </p>
                  {!peutOuvrir && (
                    <p className="text-xs text-text-muted mt-1">Scellée encore {joursRestants} jour{joursRestants > 1 ? 's' : ''}</p>
                  )}
                </div>
                {peutOuvrir && !dejaOuverte && (
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={async () => {
                      await ouvrirCapsule(c.id)
                      setCapsuleOuverte(c.id)
                    }}
                  >
                    Ouvrir
                  </Button>
                )}
              </div>

              {(dejaOuverte || estOuverte) && (
                <div className="bg-surface rounded-xl p-4 border border-border">
                  <p className="text-sm text-text-soft whitespace-pre-wrap leading-relaxed">{c.content}</p>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
