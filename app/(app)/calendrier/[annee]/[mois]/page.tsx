import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { cn } from '@/utils/cn'

interface Props {
  params: Promise<{ annee: string; mois: string }>
}

export default async function CalendrierPage({ params }: Props) {
  const { annee, mois } = await params
  const anneeNum = Number(annee)
  const moisNum = Number(mois)

  if (isNaN(anneeNum) || isNaN(moisNum) || moisNum < 1 || moisNum > 12) {
    redirect('/calendrier')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single()

  const dateActuelle = new Date(anneeNum, moisNum - 1, 1)
  const titre = format(dateActuelle, 'MMMM yyyy', { locale: fr })

  // Navigation mois précédent / suivant
  const moisPrecedent = new Date(anneeNum, moisNum - 2, 1)
  const moisSuivant = new Date(anneeNum, moisNum, 1)
  const lienPrecedent = `/calendrier/${format(moisPrecedent, 'yyyy')}/${format(moisPrecedent, 'M')}`
  const lienSuivant = `/calendrier/${format(moisSuivant, 'yyyy')}/${format(moisSuivant, 'M')}`

  // Jours du mois
  const debut = startOfMonth(dateActuelle)
  const fin = endOfMonth(dateActuelle)
  const jours = eachDayOfInterval({ start: debut, end: fin })

  // Décalage pour que lundi = 0
  let decalage = getDay(debut) - 1
  if (decalage < 0) decalage = 6

  // Souvenirs du mois
  type SouvenirJour = { date: string; count: number }
  let souvenirParJour: Record<string, number> = {}

  if (memberRow?.couple_id) {
    const { data: souvenirs } = await supabase
      .from('memories')
      .select('date')
      .eq('couple_id', memberRow.couple_id)
      .gte('date', format(debut, 'yyyy-MM-dd'))
      .lte('date', format(fin, 'yyyy-MM-dd'))

    souvenirParJour = (souvenirs ?? []).reduce<Record<string, number>>((acc, s) => {
      acc[s.date] = (acc[s.date] ?? 0) + 1
      return acc
    }, {})
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

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-4">

        {/* Navigation */}
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

        {/* Grille */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* En-têtes jours */}
          <div className="grid grid-cols-7 border-b border-border">
            {joursSemaine.map((j) => (
              <div key={j} className="py-3 text-center text-xs font-medium text-text-muted">
                {j}
              </div>
            ))}
          </div>

          {/* Jours */}
          <div className="grid grid-cols-7">
            {/* Cases vides au début */}
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

        {/* Légende */}
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
    </>
  )
}
