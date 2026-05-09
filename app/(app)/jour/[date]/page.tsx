import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

const EMOJIS_TYPE: Record<string, string> = {
  sortie: '🎉', voyage: '✈️', repas: '🍽', anniversaire: '🎂',
  quotidien: '☀️', premiere_fois: '⭐', autre: '♡',
}

interface Props {
  params: Promise<{ date: string }>
}

export default async function JourPage({ params }: Props) {
  const { date } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single()

  if (!memberRow) redirect('/onboarding')

  const { data: souvenirs } = await supabase
    .from('memories')
    .select('*, memory_photos(*), profiles(full_name, avatar_url)')
    .eq('couple_id', memberRow.couple_id)
    .eq('date', date)
    .order('created_at', { ascending: false })

  let dateParsee: Date
  try {
    dateParsee = parseISO(date)
  } catch {
    redirect('/calendrier')
  }

  const titre = format(dateParsee, "EEEE d MMMM yyyy", { locale: fr })

  return (
    <>
      <Header
        title={format(dateParsee, "d MMMM", { locale: fr })}
        subtitle={format(dateParsee, "yyyy", { locale: fr })}
        actions={
          <Link href={`/souvenirs/nouveau?date=${date}`}>
            <Button size="sm" icon={<Plus size={14} />}>
              Ajouter
            </Button>
          </Link>
        }
      />

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-4">
        <h2 className="text-sm font-medium text-text-muted capitalize">{titre}</h2>

        {!souvenirs?.length ? (
          <Card className="text-center py-12 space-y-4">
            <div className="size-14 rounded-full bg-primary-light flex items-center justify-center text-2xl mx-auto">
              ♡
            </div>
            <div>
              <p className="text-sm font-medium text-text">Aucun souvenir ce jour-là</p>
              <p className="text-xs text-text-muted mt-1">Ajoutez un souvenir pour garder ce moment.</p>
            </div>
            <Link href={`/souvenirs/nouveau?date=${date}`}>
              <Button variant="secondary" size="sm">Ajouter un souvenir</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {souvenirs.map((souvenir: any) => (
              <Link key={souvenir.id} href={`/souvenirs/${souvenir.id}`}>
                <Card hover className="space-y-3">
                  {/* En-tête souvenir */}
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-primary-light flex items-center justify-center text-lg shrink-0">
                      {EMOJIS_TYPE[souvenir.type] ?? '♡'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text">{souvenir.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        par {souvenir.profiles?.full_name ?? 'Vous'}
                      </p>
                    </div>
                    {souvenir.memory_photos?.length > 0 && (
                      <span className="text-xs text-text-muted shrink-0">
                        {souvenir.memory_photos.length} photo{souvenir.memory_photos.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Note */}
                  {souvenir.note && (
                    <p className="text-sm text-text-soft line-clamp-2">{souvenir.note}</p>
                  )}

                  {/* Réactions */}
                  <div className="flex items-center gap-1 pt-1">
                    <Heart size={13} className="text-primary" />
                    <span className="text-xs text-text-muted">Voir le souvenir</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
