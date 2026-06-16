import { redirect } from 'next/navigation'
import { format, addYears } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { getR2Url } from '@/lib/r2'
import { Header } from '@/components/layout/header'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Calendar, Images, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { WidgetAujourdhui } from '@/components/shared/widget-aujourdhui'
import { questionDuJour } from '@/features/questions/questions'
import type { MoodType } from '@/features/humeurs/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const [profileRes, memberRowRes] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('couple_members')
      .select('couple_id, couples(id, name, start_date, cover_url)')
      .eq('user_id', user.id)
      .single(),
  ])
  const profile = profileRes.data as { full_name: string | null } | null
  const memberRow = memberRowRes.data as {
    couple_id: string
    couples: { id: string; name: string; start_date: string | null; cover_url: string | null }
  } | null

  const couple = memberRow?.couples ?? null
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  const debutMois   = format(new Date(now.getFullYear(), now.getMonth(), 1),      'yyyy-MM-dd')
  const finMois     = format(new Date(now.getFullYear(), now.getMonth() + 1, 0),  'yyyy-MM-dd')
  const debutAnPasse = format(new Date(now.getFullYear() - 1, now.getMonth(), 1),     'yyyy-MM-dd')
  const finAnPasse   = format(new Date(now.getFullYear() - 1, now.getMonth() + 1, 0), 'yyyy-MM-dd')

  type SouvenirRow = { id: string; title: string; date: string; type: string; memory_photos: { storage_path: string }[] }
  type SouvenirAnRow = { id: string; title: string; date: string }
  type SouvenirPhotoRow = { id: string; title: string; date: string; memory_photos: { storage_path: string; media_type: string }[] }
  type DateRow = { id: string; title: string; date: string; recurrent: boolean }
  type MessageRow = { id: string; content: string; author_id: string; profiles: { full_name: string | null } }
  type MoodRow = { user_id: string; mood: string; profiles: { full_name: string | null } }

  const noData = { data: [] }

  const [
    { data: souvenirsRecents },
    { data: souvenirsDernierAn },
    { data: souvenirsPourPhoto },
    { data: datesImportantes },
    { data: messagesAujourdhui },
    { data: humeursAujourdhui },
  ] = await Promise.all([
    couple
      ? supabase.from('memories').select('id, title, date, type, memory_photos(storage_path)')
          .eq('couple_id', couple.id).gte('date', debutMois).lte('date', finMois)
          .order('date', { ascending: false }).limit(3)
      : noData,
    couple
      ? supabase.from('memories').select('id, title, date')
          .eq('couple_id', couple.id).gte('date', debutAnPasse).lte('date', finAnPasse)
          .order('date', { ascending: false }).limit(5)
      : noData,
    couple
      ? supabase.from('memories').select('id, title, date, memory_photos(storage_path, media_type)')
          .eq('couple_id', couple.id).limit(50)
      : noData,
    couple
      ? supabase.from('important_dates').select('id, title, date, recurrent').eq('couple_id', couple.id)
      : noData,
    couple
      ? supabase.from('daily_messages').select('id, content, author_id, profiles(full_name)')
          .eq('couple_id', couple.id).eq('date', today)
      : noData,
    couple
      ? supabase.from('daily_moods').select('user_id, mood, profiles(full_name)')
          .eq('couple_id', couple.id).eq('date', today)
      : noData,
  ]) as [
    { data: SouvenirRow[] | null },
    { data: SouvenirAnRow[] | null },
    { data: SouvenirPhotoRow[] | null },
    { data: DateRow[] | null },
    { data: MessageRow[] | null },
    { data: MoodRow[] | null },
  ]

  // Photo du jour — stable toute la journée (change chaque jour, pas à chaque rechargement)
  const avecPhotos = (souvenirsPourPhoto ?? []).filter((m) => m.memory_photos.some((p) => p.media_type === 'photo'))
  const indexJour = Math.floor(now.getTime() / 86_400_000)
  const souvenirAleatoire = avecPhotos.length > 0
    ? avecPhotos[indexJour % avecPhotos.length]
    : null
  const photoAleatoirePath = souvenirAleatoire?.memory_photos.find((p) => p.media_type === 'photo')?.storage_path ?? null
  const photoAleatoireUrl = photoAleatoirePath
    ? await getR2Url(photoAleatoirePath).catch(() => null)
    : null

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

  const monMessage = messagesAujourdhui?.find(m => m.author_id === user.id) ?? null
  const messagePartenaire = messagesAujourdhui?.find(m => m.author_id !== user.id) ?? null

  const monHumeur = (humeursAujourdhui?.find(h => h.user_id === user.id)?.mood as MoodType) ?? null
  const humeurPartenairRow = humeursAujourdhui?.find(h => h.user_id !== user.id)
  const humeurPartenaire = humeurPartenairRow
    ? { mood: humeurPartenairRow.mood as MoodType, prenomUser: humeurPartenairRow.profiles?.full_name?.split(' ')[0] ?? 'Partenaire' }
    : null

  // Question du jour
  type ReponseRow = { user_id: string; answer: string; profiles: { full_name: string | null } }
  const { data: reponsesQuestion } = couple ? (await supabase
    .from('daily_question_answers')
    .select('user_id, answer, profiles(full_name)')
    .eq('couple_id', couple.id)
    .eq('date', today)) as { data: ReponseRow[] | null }
    : { data: [] as ReponseRow[] }

  const maRepRow = reponsesQuestion?.find(r => r.user_id === user.id) ?? null
  const repPartenaireRow = reponsesQuestion?.find(r => r.user_id !== user.id) ?? null
  const question = {
    texte: questionDuJour(today),
    maReponse: maRepRow?.answer ?? null,
    reponsePartenaire: maRepRow && repPartenaireRow ? repPartenaireRow.answer : null,
    partenaireARepondu: !!repPartenaireRow,
    prenomPartenaire: repPartenaireRow?.profiles?.full_name?.split(' ')[0] ?? 'Ton/ta partenaire',
  }

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

        {/* Widget de la journée : message + humeur */}
        {couple && (
          <WidgetAujourdhui
            messagePartenaire={messagePartenaire ? {
              id: messagePartenaire.id,
              content: messagePartenaire.content,
              prenomAuteur: messagePartenaire.profiles?.full_name?.split(' ')[0] ?? 'Partenaire',
            } : null}
            monMessage={monMessage ? { id: monMessage.id, content: monMessage.content } : null}
            monHumeur={monHumeur}
            humeurPartenaire={humeurPartenaire}
            question={question}
          />
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

        {/* Photo du jour */}
        {couple && souvenirAleatoire && photoAleatoireUrl && (
          <Link href={`/souvenirs/${souvenirAleatoire.id}`}>
            <div className="flex justify-center py-2">
              <div className={[
                'bg-white dark:bg-neutral-800 p-3 pb-10 shadow-lg rounded-sm',
                'w-56 cursor-pointer transition-all duration-300 hover:scale-105',
                'rotate-[-2deg] hover:rotate-0',
              ].join(' ')}>
                <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-surface-raised">
                  <Image
                    src={photoAleatoireUrl}
                    alt={souvenirAleatoire.title}
                    fill
                    className="object-cover"
                    sizes="224px"
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">
                    {souvenirAleatoire.title}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {format(new Date(souvenirAleatoire.date), 'd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            </div>
          </Link>
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


      </div>
    </>
  )
}
