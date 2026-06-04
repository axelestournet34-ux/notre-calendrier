import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Music } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

type MemoryChanson = { id: string; title: string; date: string; chanson_url: string }

function extraireIdSpotify(url: string): string | null {
  const match = url.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/)
  return match?.[1] ?? null
}

function extraireIdYoutube(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  return match?.[1] ?? null
}

function ChansonEmbed({ memory }: { memory: MemoryChanson }) {
  const spotifyId = extraireIdSpotify(memory.chanson_url)
  const youtubeId = extraireIdYoutube(memory.chanson_url)

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text truncate">{memory.title}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {format(new Date(memory.date), 'd MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <Link
          href={`/souvenirs/${memory.id}`}
          className="text-xs text-primary hover:underline shrink-0"
        >
          Voir le souvenir
        </Link>
      </div>

      {spotifyId && (
        <iframe
          src={`https://open.spotify.com/embed/track/${spotifyId}`}
          width="100%"
          height="80"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl"
          title={`Spotify – ${memory.title}`}
        />
      )}

      {!spotifyId && youtubeId && (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          width="100%"
          height="200"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="rounded-xl"
          title={`YouTube – ${memory.title}`}
        />
      )}

      {!spotifyId && !youtubeId && (
        <a
          href={memory.chanson_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Music size={14} />
          Écouter la chanson
        </a>
      )}
    </Card>
  )
}

export default async function NotreChansonPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single()

  if (!memberRow) {
    return (
      <>
        <Header title="Notre chanson" subtitle="La bande-son de votre histoire" />
        <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto">
          <p className="text-sm text-text-muted text-center py-10">
            Vous n'appartenez pas encore à un couple.
          </p>
        </div>
      </>
    )
  }

  type MemoryRow = { id: string; title: string; date: string; chanson_url: string | null }
  const { data: rows } = await supabase
    .from('memories')
    .select('id, title, date, chanson_url')
    .eq('couple_id', memberRow.couple_id)
    .not('chanson_url', 'is', null)
    .order('date', { ascending: false }) as { data: MemoryRow[] | null }

  const memories: MemoryChanson[] = (rows ?? [])
    .filter((r): r is MemoryChanson => !!r.chanson_url)

  const spotify = memories.filter((m) => extraireIdSpotify(m.chanson_url) !== null)
  const youtube = memories.filter((m) => !extraireIdSpotify(m.chanson_url) && extraireIdYoutube(m.chanson_url) !== null)
  const autres  = memories.filter((m) => !extraireIdSpotify(m.chanson_url) && !extraireIdYoutube(m.chanson_url))

  return (
    <>
      <Header title="Notre chanson" subtitle="La bande-son de votre histoire" />

      <div className="px-4 lg:px-6 py-6 space-y-6 max-w-2xl mx-auto w-full">

        <Card className="bg-gradient-to-br from-primary-light via-rose-50 to-accent-light dark:from-primary-light dark:via-rose-950/20 dark:to-accent-light border-none">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
              <Music size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Vos chansons</p>
              <p className="text-xs text-text-muted">
                {memories.length} chanson{memories.length !== 1 ? 's' : ''} dans votre histoire
              </p>
            </div>
          </div>
        </Card>

        {memories.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <div className="size-14 rounded-full bg-primary-light flex items-center justify-center mx-auto">
              <Music size={28} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-text">Aucune chanson pour l'instant</p>
            <p className="text-xs text-text-muted">
              Ajoutez une URL Spotify ou YouTube dans vos souvenirs pour les retrouver ici.
            </p>
          </div>
        )}

        {spotify.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <span className="size-4 flex items-center justify-center text-green-500">♫</span>
              Spotify ({spotify.length})
            </p>
            {spotify.map((m) => <ChansonEmbed key={m.id} memory={m} />)}
          </section>
        )}

        {youtube.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <span className="size-4 flex items-center justify-center text-red-500">▶</span>
              YouTube ({youtube.length})
            </p>
            {youtube.map((m) => <ChansonEmbed key={m.id} memory={m} />)}
          </section>
        )}

        {autres.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Autres ({autres.length})
            </p>
            {autres.map((m) => <ChansonEmbed key={m.id} memory={m} />)}
          </section>
        )}

      </div>
    </>
  )
}
