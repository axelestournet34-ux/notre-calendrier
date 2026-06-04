import { format, isPast, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Lock, Unlock, Mail } from 'lucide-react'
import { DEMO_CAPSULES } from '@/lib/demo-data'
import { cn } from '@/utils/cn'

export default function CapsulesPage() {
  const now = new Date()

  return (
    <>
      <Header title="Capsules temporelles" subtitle="Des messages pour le futur" />
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-4">
        {DEMO_CAPSULES.map((capsule) => {
          const openDate = new Date(capsule.open_date)
          const estOuverte = capsule.opened_at !== null
          const peutOuvrir = isPast(openDate) && !estOuverte
          const joursRestants = !isPast(openDate) ? differenceInDays(openDate, now) : 0

          return (
            <Card key={capsule.id} className={cn(
              'space-y-3',
              estOuverte && 'border-green-200 dark:border-green-800'
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  'size-10 rounded-xl flex items-center justify-center shrink-0',
                  estOuverte
                    ? 'bg-green-100 dark:bg-green-950/30'
                    : peutOuvrir
                    ? 'bg-accent-light'
                    : 'bg-surface-raised'
                )}>
                  {estOuverte ? (
                    <Unlock size={18} className="text-green-500" />
                  ) : (
                    <Lock size={18} className={peutOuvrir ? 'text-accent' : 'text-text-muted'} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text">{capsule.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Par {capsule.author_name} · À ouvrir le {format(openDate, 'd MMMM yyyy', { locale: fr })}
                  </p>
                  {!estOuverte && !peutOuvrir && (
                    <p className="text-xs text-text-muted mt-1">
                      🔒 Dans {joursRestants} jour{joursRestants > 1 ? 's' : ''}
                    </p>
                  )}
                  {peutOuvrir && (
                    <p className="text-xs text-accent mt-1 font-medium">✨ Prête à être ouverte !</p>
                  )}
                </div>
                {estOuverte && (
                  <span className="text-xs bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full shrink-0">
                    Ouverte
                  </span>
                )}
              </div>

              {estOuverte && (
                <div className="bg-surface-raised rounded-xl p-4 ml-13">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Mail size={13} className="text-primary" />
                    <span className="text-xs font-medium text-primary">Message révélé</span>
                  </div>
                  <p className="text-sm text-text-soft whitespace-pre-wrap leading-relaxed">
                    {capsule.content}
                  </p>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </>
  )
}
