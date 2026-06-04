import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { DEMO_MEMORIES } from '@/lib/demo-data'

const EMOJIS_TYPE: Record<string, string> = {
  sortie: '🎉', voyage: '✈️', repas: '🍽', anniversaire: '🎂',
  quotidien: '☀️', premiere_fois: '⭐', autre: '♡',
}
const LABELS_TYPE: Record<string, string> = {
  sortie: 'Sortie', voyage: 'Voyage', repas: 'Repas', anniversaire: 'Anniversaire',
  quotidien: 'Quotidien', premiere_fois: 'Première fois', autre: 'Autre',
}

export default function TimelinePage() {
  const sorted = [...DEMO_MEMORIES].sort((a, b) => b.date.localeCompare(a.date))

  const parMois = new Map<string, typeof sorted>()
  for (const s of sorted) {
    const cle = s.date.slice(0, 7)
    if (!parMois.has(cle)) parMois.set(cle, [])
    parMois.get(cle)!.push(s)
  }

  return (
    <>
      <Header
        title="Timeline"
        subtitle={`${DEMO_MEMORIES.length} souvenirs`}
      />
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-8">
        {Array.from(parMois.entries()).map(([cleM, items]) => (
          <div key={cleM} className="space-y-3">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider capitalize">
              {format(new Date(`${cleM}-01`), 'MMMM yyyy', { locale: fr })}
            </h2>
            <div className="relative pl-5 space-y-4">
              <div className="absolute left-1.5 top-0 bottom-0 w-px bg-border" />
              {items.map((s) => (
                <Link key={s.id} href={`/souvenirs/${s.id}`} className="block">
                  <div className="relative">
                    <div className="absolute -left-5 top-3 size-2.5 rounded-full bg-primary ring-2 ring-bg" />
                    <Card hover className="space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0">{EMOJIS_TYPE[s.type] ?? '♡'}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-text truncate">{s.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-text-muted">
                              {format(new Date(s.date), 'd MMM', { locale: fr })}
                            </span>
                            <span className="text-xs text-primary bg-primary-light px-1.5 py-0.5 rounded-full">
                              {LABELS_TYPE[s.type]}
                            </span>
                            {s.photos.length > 0 && (
                              <span className="text-xs text-text-muted">
                                {s.photos.length} photo{s.photos.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {s.note && (
                        <p className="text-sm text-text-soft line-clamp-2 pl-8">{s.note}</p>
                      )}
                    </Card>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
