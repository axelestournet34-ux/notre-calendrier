import { format, addYears } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Star, RefreshCw } from 'lucide-react'
import { DEMO_DATES } from '@/lib/demo-data'

const LABELS_TYPE: Record<string, string> = {
  anniversaire: 'Anniversaire',
  premiere_rencontre: 'Première rencontre',
  voyage: 'Voyage',
  personnalise: 'Date personnalisée',
}

export default function DatesImportantesPage() {
  const now = new Date()

  const datesAvecProchaine = DEMO_DATES.map((d) => {
    const [y, m, day] = d.date.split('-').map(Number)
    let nextDate: Date
    if (d.recurrent) {
      nextDate = new Date(now.getFullYear(), m - 1, day)
      if (nextDate <= now) nextDate = addYears(nextDate, 1)
    } else {
      nextDate = new Date(y, m - 1, day)
    }
    const diff = nextDate.getTime() - now.getTime()
    const jours = Math.ceil(diff / 86400000)
    return { ...d, nextDate, jours }
  }).sort((a, b) => a.jours - b.jours)

  return (
    <>
      <Header title="Dates importantes" subtitle="Vos moments à ne pas oublier" />
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-3">
        {datesAvecProchaine.map((d) => {
          const passe = d.jours < 0
          return (
            <Card key={d.id} className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                <Star size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text truncate">{d.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-muted">
                    {format(d.nextDate, 'd MMMM', { locale: fr })}
                  </span>
                  <span className="text-xs text-primary bg-primary-light px-1.5 py-0.5 rounded-full">
                    {LABELS_TYPE[d.type] ?? d.type}
                  </span>
                  {d.recurrent && <RefreshCw size={10} className="text-text-muted" />}
                </div>
                {d.notes && <p className="text-xs text-text-muted mt-1 italic">{d.notes}</p>}
              </div>
              <div className="text-right shrink-0">
                {passe ? (
                  <p className="text-xs text-text-muted">Passé</p>
                ) : (
                  <>
                    <p className="text-xl font-bold text-primary">{d.jours}</p>
                    <p className="text-xs text-text-muted">jour{d.jours > 1 ? 's' : ''}</p>
                  </>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
