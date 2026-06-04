import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Check, Circle, Clock } from 'lucide-react'
import { DEMO_BUCKET } from '@/lib/demo-data'
import { cn } from '@/utils/cn'

const STATUTS = {
  a_faire:  { label: 'À faire',  icon: Circle, color: 'text-text-muted',  bg: 'bg-surface-raised' },
  en_cours: { label: 'En cours', icon: Clock,  color: 'text-accent',      bg: 'bg-accent-light' },
  realise:  { label: 'Réalisé',  icon: Check,  color: 'text-green-500',   bg: 'bg-green-50 dark:bg-green-950/20' },
}

export default function BucketListPage() {
  const aFaire  = DEMO_BUCKET.filter((i) => i.status === 'a_faire')
  const enCours = DEMO_BUCKET.filter((i) => i.status === 'en_cours')
  const realise = DEMO_BUCKET.filter((i) => i.status === 'realise')

  const sections = [
    { titre: 'En cours', items: enCours, statut: 'en_cours' as const },
    { titre: 'À faire', items: aFaire, statut: 'a_faire' as const },
    { titre: 'Réalisés', items: realise, statut: 'realise' as const },
  ]

  return (
    <>
      <Header title="Bucket list" subtitle="Vos rêves à réaliser ensemble" />
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'À faire',  count: aFaire.length,  color: 'text-text-muted' },
            { label: 'En cours', count: enCours.length, color: 'text-accent' },
            { label: 'Réalisés', count: realise.length, color: 'text-green-500' },
          ].map(({ label, count, color }) => (
            <Card key={label} className="text-center">
              <p className={cn('text-2xl font-bold', color)}>{count}</p>
              <p className="text-xs text-text-muted mt-0.5">{label}</p>
            </Card>
          ))}
        </div>

        {sections.map(({ titre, items, statut }) => {
          if (!items.length) return null
          const { icon: Icon, color, bg } = STATUTS[statut]
          return (
            <div key={statut} className="space-y-2">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{titre}</p>
              {items.map((item) => (
                <Card key={item.id} className="space-y-1">
                  <div className="flex items-start gap-3">
                    <div className={cn('size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', bg)}>
                      <Icon size={14} className={color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm font-medium', statut === 'realise' ? 'line-through text-text-muted' : 'text-text')}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        })}

      </div>
    </>
  )
}
