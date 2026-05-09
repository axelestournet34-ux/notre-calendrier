import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const EMOJIS_TYPE: Record<string, string> = {
  sortie: '🎉', voyage: '✈️', repas: '🍽', anniversaire: '🎂',
  quotidien: '☀️', premiere_fois: '⭐', autre: '♡',
}

const LABELS_TYPE: Record<string, string> = {
  sortie: 'Sortie', voyage: 'Voyage', repas: 'Repas', anniversaire: 'Anniversaire',
  quotidien: 'Quotidien', premiere_fois: 'Première fois', autre: 'Autre',
}

export default async function TimelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/onboarding')

  const { data: souvenirs } = await supabase
    .from('memories')
    .select('*, memory_photos(id, storage_path), profiles(full_name)')
    .eq('couple_id', memberRow.couple_id)
    .order('date', { ascending: false })
    .limit(100) as {
      data: {
        id: string; date: string; title: string; note: string | null
        type: string; author_id: string
        memory_photos: { id: string; storage_path: string }[]
        profiles: { full_name: string | null }
      }[] | null
    }

  // Grouper par mois
  const parMois = new Map<string, typeof souvenirs>()
  for (const s of souvenirs ?? []) {
    const cle = format(parseISO(s.date), 'yyyy-MM')
    if (!parMois.has(cle)) parMois.set(cle, [])
    parMois.get(cle)!.push(s)
  }

  return (
    <>
      <Header
        title="Timeline"
        subtitle={`${souvenirs?.length ?? 0} souvenir${(souvenirs?.length ?? 0) > 1 ? 's' : ''}`}
        actions={
          <Link href="/souvenirs/nouveau">
            <Button size="sm" icon={<Plus size={14} />}>Ajouter</Button>
          </Link>
        }
      />

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-8">
        {parMois.size === 0 ? (
          <Card className="text-center py-14 space-y-4">
            <div className="size-14 rounded-full bg-primary-light flex items-center justify-center text-2xl mx-auto">♡</div>
            <p className="text-sm text-text-muted">Aucun souvenir pour l&apos;instant.</p>
            <Link href="/souvenirs/nouveau">
              <Button variant="secondary" size="sm">Ajouter le premier</Button>
            </Link>
          </Card>
        ) : (
          Array.from(parMois.entries()).map(([cleM, items]) => {
            const dateM = parseISO(`${cleM}-01`)
            return (
              <div key={cleM} className="space-y-3">
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider capitalize">
                  {format(dateM, 'MMMM yyyy', { locale: fr })}
                </h2>

                <div className="relative pl-5 space-y-4">
                  <div className="absolute left-1.5 top-0 bottom-0 w-px bg-border" />

                  {items!.map((s) => (
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
                                  {format(parseISO(s.date), 'd MMM', { locale: fr })}
                                </span>
                                <span className="text-xs text-primary bg-primary-light px-1.5 py-0.5 rounded-full">
                                  {LABELS_TYPE[s.type]}
                                </span>
                                {s.memory_photos.length > 0 && (
                                  <span className="text-xs text-text-muted">
                                    {s.memory_photos.length} photo{s.memory_photos.length > 1 ? 's' : ''}
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
            )
          })
        )}
      </div>
    </>
  )
}
