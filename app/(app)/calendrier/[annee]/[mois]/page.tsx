import Link from 'next/link'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { CalendrierSwipe } from './calendrier-swipe'
import { DEMO_MEMORIES } from '@/lib/demo-data'
import { cn } from '@/utils/cn'

export function generateStaticParams() {
  const mois = new Set(DEMO_MEMORIES.map((m) => m.date.slice(0, 7)))
  // Add current month and a few extra
  const now = new Date()
  for (let i = -1; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    mois.add(format(d, 'yyyy-MM'))
  }
  return [...mois].map((ym) => {
    const [annee, moisNum] = ym.split('-')
    return { annee, mois: String(Number(moisNum)) }
  })
}

interface Props {
  params: Promise<{ annee: string; mois: string }>
}

export default async function CalendrierPage({ params }: Props) {
  const { annee, mois } = await params
  const anneeNum = Number(annee)
  const moisNum = Number(mois)

  const dateActuelle = new Date(anneeNum, moisNum - 1, 1)
  const titre = format(dateActuelle, 'MMMM yyyy', { locale: fr })

  const moisPrecedent = new Date(anneeNum, moisNum - 2, 1)
  const moisSuivant = new Date(anneeNum, moisNum, 1)
  const lienPrecedent = `/calendrier/${format(moisPrecedent, 'yyyy')}/${format(moisPrecedent, 'M')}`
  const lienSuivant = `/calendrier/${format(moisSuivant, 'yyyy')}/${format(moisSuivant, 'M')}`

  const debut = startOfMonth(dateActuelle)
  const fin = endOfMonth(dateActuelle)
  const jours = eachDayOfInterval({ start: debut, end: fin })

  let decalage = getDay(debut) - 1
  if (decalage < 0) decalage = 6

  // Count memories per day from demo data
  const souvenirParJour: Record<string, number> = {}
  for (const m of DEMO_MEMORIES) {
    if (m.date >= format(debut, 'yyyy-MM-dd') && m.date <= format(fin, 'yyyy-MM-dd')) {
      souvenirParJour[m.date] = (souvenirParJour[m.date] ?? 0) + 1
    }
  }

  const joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <>
      <Header
        title="Calendrier"
        subtitle={titre}
        actions={
          <Link
            href="/souvenirs/nouveau"
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Plus size={14} />
            Ajouter
          </Link>
        }
      />

      <CalendrierSwipe lienPrecedent={lienPrecedent} lienSuivant={lienSuivant}>
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-4">

        <div className="flex items-center justify-between">
          <Link
            href={lienPrecedent}
            className="flex items-center gap-1.5 text-sm text-text-soft hover:text-text transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-raised"
          >
            <ChevronLeft size={16} />
            {format(moisPrecedent, 'MMM', { locale: fr })}
          </Link>

          <h2 className="text-base font-semibold text-text capitalize">{titre}</h2>

          <Link
            href={lienSuivant}
            className="flex items-center gap-1.5 text-sm text-text-soft hover:text-text transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-raised"
          >
            {format(moisSuivant, 'MMM', { locale: fr })}
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 border-b border-border">
            {joursSemaine.map((j) => (
              <div key={j} className="py-3 text-center text-xs font-medium text-text-muted">
                {j}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: decalage }).map((_, i) => (
              <div key={`vide-${i}`} className="aspect-square border-b border-r border-border/50 last:border-r-0" />
            ))}

            {jours.map((jour, idx) => {
              const dateStr = format(jour, 'yyyy-MM-dd')
              const nbSouvenirs = souvenirParJour[dateStr] ?? 0
              const estAujourdhui = isToday(jour)
              const estMoisActuel = isSameMonth(jour, dateActuelle)
              const colonne = (decalage + idx) % 7

              return (
                <Link
                  key={dateStr}
                  href={`/jour/${dateStr}`}
                  className={cn(
                    'aspect-square flex flex-col items-center justify-center gap-1 relative',
                    'border-b border-r border-border/50 transition-colors',
                    colonne === 6 && 'border-r-0',
                    nbSouvenirs > 0
                      ? 'hover:bg-primary-light/50 cursor-pointer'
                      : 'hover:bg-surface-raised cursor-pointer',
                    !estMoisActuel && 'opacity-30'
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors',
                      estAujourdhui
                        ? 'bg-primary text-white'
                        : 'text-text'
                    )}
                  >
                    {format(jour, 'd')}
                  </span>

                  {nbSouvenirs > 0 && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(nbSouvenirs, 3) }).map((_, i) => (
                        <div key={i} className="size-1 rounded-full bg-primary" />
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-text-muted px-1">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-primary" />
            Souvenir
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">·</div>
            Aujourd&apos;hui
          </div>
        </div>

      </div>
      </CalendrierSwipe>
    </>
  )
}
