import { redirect } from 'next/navigation'
import { format, addYears } from 'date-fns'
import { fr } from 'date-fns/locale'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Calendar, Images, Plus } from 'lucide-react'
import Link from 'next/link'
import { MessageDuJour } from '@/components/shared/message-du-jour'
import { HumeurDuJour } from '@/components/shared/humeur-du-jour'
import type { MoodType } from '@/features/humeurs/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user.id).single() as { data: { full_name: string | null } | null }

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id, couples(id, name, start_date, cover_url)')
    .eq('user_id', user.id)
    .single() as {
      data: {
        couple_id: string
        couples: { id: string; name: string; start_date: string | null; cover_url: string | null }
      } | null
    }

  const couple = memberRow?.couples ?? null
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // Souvenirs du mois
  const debutMois = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd')
  const finMois   = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd')
  type SouvenirRow = { id: string; title: string; date: string; type: string; memory_photos: { storage_path: string }[] }
  const { data: souvenirsRecents } = (
    couple ? await supabase.from('memories')
      .select('id, title, date, type, memory_photos(storage_path)')
      .eq('couple_id', couple.id)
      .gte('date', debutMois).lte('date', finMois)
      .order('date', { ascending: false }).limit(3)
    : { data: [] }
  ) as { data: SouvenirRow[] | null }

  // Il y a un an
  const debutAnPasse = format(new Date(now.getFullYear() - 1, now.getMonth(), 1), 'yyyy-MM-dd')
  const finAnPasse   = format(new Date(now.getFullYear() - 1, now.getMonth() + 1, 0), 'yyyy-MM-dd')
  type SouvenirAnRow = { id: string; title: string; date: string }
  const { data: souvenirsDernierAn } = (
    couple ? await supabase.from('memories')
      .select('id, title, date').eq('couple_id', couple.id)
      .gte('date', debutAnPasse).lte('date', finAnPasse)
      .order('date', { ascending: false }).limit(5)
    : { data: [] }
  ) as { data: SouvenirAnRow[] | null }

  // Prochaine date importante
  type DateRow = { id: string; title: string; date: string; recurrent: boolean }
  const { data: datesImportantes } = (
    couple ? await supabase.from('important_dates').select('id, title, date, recurrent').eq('couple_id', couple.id)
    : { data: [] }
  ) as { data: DateRow[] | null }

  function trouverProchaineDate(dates: DateRow[], maintenant: Date) {
    let minMs = Infinity
    let found: (DateRow & { nextDate: Date }) | null = null
    for (const d of dates ?? []) {
      const [y, m, day] = d.date.split('-').map(Number)
      let nextDate: Date
      if (d.recurrent) {
        nextDate = new Date(maintenant.getFullYear(), m - 1, day)
        if (nextDate <= maintenant) nextDate = addYears(nextDate, 1)
      } else {
        nextDate = new Date(y, m - 1, day)
        if (nextDate <= maintenant) continue
      }
      const diff = nextDate.getTime() - maintenant.getTime()
      if (diff < minMs) { minMs = diff; found = { ...d, nextDate } }
    }
    return found
  }
  const prochaineDate = trouverProchaineDate(datesImportantes ?? [], now)
  const joursAvantDate = prochaineDate
    ? Math.ceil((prochaineDate.nextDate.getTime() - now.getTime()) / 86400000)
    : null

  // Messages du jour
  type MessageRow = { id: string; content: string; author_id: string; profiles: { full_name: string | null } }
  const { data: messagesAujourdhui } = couple ? (await supabase
    .from('daily_messages')
    .select('id, content, author_id, profiles(full_name)')
    .eq('couple_id', couple.id)
    .eq('date', today)) as { data: MessageRow[] | null }
    : { data: [] as MessageRow[] }

  const monMessage = messagesAujourdhui?.find(m => m.author_id === user.id) ?? null
  const messagePartenaire = messagesAujourdhui?.find(m => m.author_id !== user.id) ?? null

  // Humeurs du jour
  type MoodRow = { user_id: string; mood: string; profiles: { full_name: string | null } }
  const { data: humeursAujourdhui } = couple ? (await supabase
    .from('daily_moods')
    .select('user_id, mood, profiles(full_name)')
    .eq('couple_id', couple.id)
    .eq('date', today)) as { data: MoodRow[] | null }
    : { data: [] as MoodRow[] }

  const monHumeur = (humeursAujourdhui?.find(h => h.user_id === user.id)?.mood as MoodType) ?? null
  const humeurPartenairRow = humeursAujourdhui?.find(h => h.user_id !== user.id)
  const humeurPartenaire = humeurPartenairRow
    ? { mood: humeurPartenairRow.mood as MoodType, prenomUser: humeurPartenairRow.profiles?.full_name?.split(' ')[0] ?? 'Partenaire' }
    : null

  // Jours ensemble
  const joursEnsemble = couple?.start_date
    ? Math.floor((now.getTime() - new Date(couple.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const prenom = profile?.full_name?.split(' ')[0] ?? 'vous'
  const moisActuel = format(now, 'MMMM yyyy', { locale: fr })

  return (
    <>
      <Header
        title={`Bonjour, ${prenom} ♡`}
        subtitle={format(now, "EEEE d MMMM yyyy", { locale: fr })}
      />

      <div className="px-4 lg:px-6 py-6 space-y-5 max-w-4xl mx-auto w-full">

        {/* Hero */}
        <Card className="bg-gradient-to-br from-primary-light via-rose-50 to-accent-light dark:from-primary-light dark:via-rose-950/20 dark:to-accent-light border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wider">{moisActuel}</p>
              <h2 className="mt-1 text-2xl font-semibold text-text">{couple?.name ?? 'Notre histoire'}</h2>
              {joursEnsemble !== null && (
                <p className="mt-1 text-sm text-text-soft">{joursEnsemble} jours ensemble ✨</p>
              )}
            </div>
            <Link href="/souvenirs/nouveau">
              <Button icon={<Plus size={16} />}>Ajouter</Button>
            </Link>
          </div>
        </Card>

        {/* Humeur du jour */}
        {couple && (
          <Card className="space-y-1">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Humeur du jour</p>
            <HumeurDuJour monHumeur={monHumeur} humeurPartenaire={humeurPartenaire} />
          </Card>
        )}

        {/* Message du jour */}
        {couple && (
          <Card className="space-y-1">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">💌 Message du jour</p>
            <MessageDuJour
              messagePartenaire={messagePartenaire ? {
                id: messagePartenaire.id,
                content: messagePartenaire.content,
                prenomAuteur: messagePartenaire.profiles?.full_name?.split(' ')[0] ?? 'Partenaire',
              } : null}
              monMessage={monMessage ? { id: monMessage.id, content: monMessage.content } : null}
            />
          </Card>
        )}

        {/* Prochaine date importante */}
        {prochaineDate && joursAvantDate !== null && (
          <Link href="/dates-importantes">
            <Card hover className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Prochaine date</p>
                <p className="text-sm font-semibold text-text mt-0.5">{prochaineDate.title}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {format(prochaineDate.nextDate, "d MMMM", { locale: fr })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-primary">{joursAvantDate}</p>
                <p className="text-xs text-text-muted">jour{joursAvantDate > 1 ? 's' : ''}</p>
              </div>
            </Card>
          </Link>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Souvenirs ce mois', value: souvenirsRecents?.length ?? 0,                                                                  icon: Heart,  color: 'text-primary',     bg: 'bg-primary-light' },
            { label: 'Jours ensemble',    value: joursEnsemble ?? '—',                                                                           icon: Calendar, color: 'text-accent',   bg: 'bg-accent-light' },
            { label: 'Photos ce mois',    value: souvenirsRecents?.reduce((acc, s) => acc + (s.memory_photos?.length ?? 0), 0) ?? 0,             icon: Images,  color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="text-center">
              <div className={`size-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-2xl font-bold text-text">{value}</p>
              <p className="text-xs text-text-muted mt-0.5">{label}</p>
            </Card>
          ))}
        </div>

        {/* Il y a un an */}
        {(souvenirsDernierAn?.length ?? 0) > 0 && (
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text">✨ Il y a un an</p>
              <span className="text-xs text-text-muted capitalize">
                {format(new Date(now.getFullYear() - 1, now.getMonth(), 1), 'MMMM yyyy', { locale: fr })}
              </span>
            </div>
            <div className="space-y-2">
              {souvenirsDernierAn!.map((s) => (
                <Link key={s.id} href={`/souvenirs/${s.id}`}
                  className="flex items-center gap-2 py-1 hover:opacity-75 transition-opacity">
                  <span className="size-1.5 rounded-full bg-primary/40 shrink-0" />
                  <span className="text-sm text-text-soft truncate">{s.title}</span>
                  <span className="text-xs text-text-muted shrink-0 ml-auto">
                    {format(new Date(s.date), 'd MMM', { locale: fr })}
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* Derniers souvenirs */}
        <Card>
          <CardHeader>
            <CardTitle>Souvenirs récents</CardTitle>
            <Link href="/timeline" className="text-xs text-primary hover:underline">Voir tout</Link>
          </CardHeader>
          {!souvenirsRecents?.length ? (
            <div className="text-center py-10 space-y-3">
              <div className="size-14 rounded-full bg-primary-light flex items-center justify-center text-2xl mx-auto">♡</div>
              <p className="text-sm text-text-muted">Aucun souvenir ce mois-ci encore.</p>
              <Link href="/souvenirs/nouveau">
                <Button variant="secondary" size="sm">Ajouter le premier</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {souvenirsRecents.map((souvenir) => (
                <Link key={souvenir.id} href={`/souvenirs/${souvenir.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-raised transition-colors">
                  <div className="size-11 rounded-xl bg-primary-light shrink-0 flex items-center justify-center text-lg">♡</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">{souvenir.title}</p>
                    <p className="text-xs text-text-muted">{format(new Date(souvenir.date), 'd MMMM', { locale: fr })}</p>
                  </div>
                  <div className="ml-auto text-xs text-text-muted shrink-0">
                    {souvenir.memory_photos?.length ?? 0} photo{(souvenir.memory_photos?.length ?? 0) > 1 ? 's' : ''}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Raccourcis */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/calendrier',        label: 'Calendrier',        emoji: '📅' },
            { href: '/galerie',           label: 'Galerie photos',    emoji: '🖼' },
            { href: '/bilan',             label: 'Bilan annuel',      emoji: '📊' },
            { href: '/stats',             label: 'Nos stats',         emoji: '✨' },
            { href: '/mots-amour',        label: 'Mots d\'amour',     emoji: '💌' },
            { href: '/lettre',            label: 'Nos lettres',       emoji: '✉️' },
            { href: '/lieux',             label: 'Nos lieux',         emoji: '📍' },
            { href: '/bucket-list',       label: 'Bucket list',       emoji: '🗺' },
            { href: '/dates-importantes', label: 'Dates importantes', emoji: '⭐' },
          ].map(({ href, label, emoji }) => (
            <Link key={href} href={href}>
              <Card hover className="flex items-center gap-3">
                <span className="text-2xl">{emoji}</span>
                <span className="text-sm font-medium text-text">{label}</span>
              </Card>
            </Link>
          ))}
        </div>

      </div>
    </>
  )
}
