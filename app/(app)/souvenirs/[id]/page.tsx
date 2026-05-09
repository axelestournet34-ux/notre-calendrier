import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, MapPin, Pencil, Music } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getR2Url } from '@/lib/r2'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { BoutonSupprimer } from '@/components/shared/bouton-supprimer'
import { ReactionBar } from '@/components/shared/reaction-bar'
import { SectionCommentaires } from '@/components/shared/section-commentaires'

const EMOJIS_TYPE: Record<string, string> = {
  sortie: '🎉', voyage: '✈️', repas: '🍽', anniversaire: '🎂',
  quotidien: '☀️', premiere_fois: '⭐', autre: '♡',
}

const LABELS_TYPE: Record<string, string> = {
  sortie: 'Sortie', voyage: 'Voyage', repas: 'Repas', anniversaire: 'Anniversaire',
  quotidien: 'Quotidien', premiere_fois: 'Première fois', autre: 'Autre',
}

const REACTION_TYPES = ['coeur', 'rire', 'etoile', 'nostalgie'] as const

interface Props {
  params: Promise<{ id: string }>
}

export default async function SouvenirPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: souvenir } = await supabase
    .from('memories')
    .select('*, memory_photos(*), profiles(full_name, avatar_url)')
    .eq('id', id)
    .single() as {
      data: {
        id: string
        couple_id: string
        author_id: string
        date: string
        title: string
        note: string | null
        type: string
        lieu: string | null
        citation: string | null
        chanson_url: string | null
        created_at: string
        memory_photos: { id: string; storage_path: string; caption: string | null; sort_order: number; media_type: string }[]
        profiles: { full_name: string | null; avatar_url: string | null }
      } | null
    }

  if (!souvenir) notFound()

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single()

  if (!memberRow || memberRow.couple_id !== souvenir.couple_id) notFound()

  const estAuteur = souvenir.author_id === user.id

  // URLs signées pour tous les médias
  const mediasAvecUrl = await Promise.all(
    (souvenir.memory_photos ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(async (m) => {
        const url = await getR2Url(m.storage_path).catch(() => null)
        return { ...m, url }
      })
  )

  const photosVideos = mediasAvecUrl.filter((m) => m.media_type !== 'audio')
  const audios = mediasAvecUrl.filter((m) => m.media_type === 'audio')
  const nbPhotos = photosVideos.filter((m) => m.media_type === 'photo').length
  const nbVideos = photosVideos.filter((m) => m.media_type === 'video').length

  // Réactions
  const { data: reactionsData } = await supabase
    .from('reactions')
    .select('type, user_id')
    .eq('memory_id', id)

  const reactionsParType = REACTION_TYPES.map((type) => ({
    type,
    count: reactionsData?.filter((r) => r.type === type).length ?? 0,
    mienne: reactionsData?.some((r) => r.type === type && r.user_id === user.id) ?? false,
  }))

  // Commentaires
  const { data: commentairesData } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, profiles(full_name)')
    .eq('memory_id', id)
    .order('created_at', { ascending: true }) as {
      data: { id: string; content: string; created_at: string; user_id: string; profiles: { full_name: string | null } }[] | null
    }

  const dateFormatee = format(parseISO(souvenir.date), "EEEE d MMMM yyyy", { locale: fr })

  return (
    <>
      <Header
        title={souvenir.title}
        subtitle={dateFormatee}
        actions={
          estAuteur ? (
            <div className="flex items-center gap-1">
              <Link
                href={`/souvenirs/${id}/modifier`}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-sm font-medium text-text-soft hover:bg-surface-raised transition-colors"
              >
                <Pencil size={14} />
                Modifier
              </Link>
              <BoutonSupprimer memoryId={id} />
            </div>
          ) : null
        }
      />

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-5">

        {/* Retour */}
        <Link
          href={`/jour/${souvenir.date}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={14} />
          {format(parseISO(souvenir.date), "d MMMM", { locale: fr })}
        </Link>

        {/* Infos */}
        <Card className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{EMOJIS_TYPE[souvenir.type] ?? '♡'}</span>
            <div>
              <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full">
                {LABELS_TYPE[souvenir.type] ?? 'Souvenir'}
              </span>
              <p className="text-xs text-text-muted mt-1">
                Ajouté par {souvenir.profiles?.full_name ?? 'vous'} · {format(parseISO(souvenir.created_at), "d MMM yyyy", { locale: fr })}
              </p>
            </div>
          </div>

          {souvenir.lieu && (
            <div className="flex items-center gap-1.5 text-sm text-text-soft border-t border-border pt-3">
              <MapPin size={13} className="text-primary shrink-0" />
              <span>{souvenir.lieu}</span>
              <a
                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(souvenir.lieu)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-primary hover:underline shrink-0"
              >
                Voir →
              </a>
            </div>
          )}

          {souvenir.note && (
            <p className="text-sm text-text-soft leading-relaxed whitespace-pre-wrap border-t border-border pt-3">
              {souvenir.note}
            </p>
          )}

          {souvenir.citation && (
            <blockquote className="border-l-2 border-primary pl-3 italic text-sm text-text-soft border-t border-border pt-3">
              « {souvenir.citation} »
            </blockquote>
          )}

          {souvenir.chanson_url && (
            <div className="flex items-center gap-2 border-t border-border pt-3">
              <Music size={14} className="text-primary shrink-0" />
              <a
                href={souvenir.chanson_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate"
              >
                {souvenir.chanson_url.includes('spotify') ? '🎵 Écouter sur Spotify' :
                 souvenir.chanson_url.includes('youtube') || souvenir.chanson_url.includes('youtu.be') ? '▶ Écouter sur YouTube' :
                 souvenir.chanson_url.includes('apple') ? '🎵 Écouter sur Apple Music' :
                 'Notre chanson →'}
              </a>
            </div>
          )}
        </Card>

        {/* Réactions */}
        <ReactionBar memoryId={id} reactions={reactionsParType} />

        {/* Photos & Vidéos */}
        {photosVideos.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-text">
              {nbPhotos > 0 && `${nbPhotos} photo${nbPhotos > 1 ? 's' : ''}`}
              {nbPhotos > 0 && nbVideos > 0 && ' · '}
              {nbVideos > 0 && `${nbVideos} vidéo${nbVideos > 1 ? 's' : ''}`}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {photosVideos.map((media) =>
                media.url ? (
                  <div
                    key={media.id}
                    className="aspect-square rounded-xl overflow-hidden bg-surface-raised"
                  >
                    {media.media_type === 'video' ? (
                      <video
                        src={media.url}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt={media.caption ?? souvenir.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Notes vocales */}
        {audios.length > 0 && (
          <Card className="space-y-3">
            <p className="text-sm font-semibold text-text">🎙 Notes vocales</p>
            {audios.map((a, i) =>
              a.url ? (
                <div key={a.id} className="space-y-1">
                  <p className="text-xs text-text-muted">Note {i + 1}</p>
                  <audio
                    src={a.url}
                    controls
                    className="w-full h-10"
                  />
                </div>
              ) : null
            )}
          </Card>
        )}

        {photosVideos.length === 0 && audios.length === 0 && (
          <Card className="text-center py-8 text-text-muted text-sm">
            Aucun média pour ce souvenir.
          </Card>
        )}

        {/* Commentaires */}
        <Card>
          <SectionCommentaires
            memoryId={id}
            commentaires={commentairesData ?? []}
            userId={user.id}
          />
        </Card>

      </div>
    </>
  )
}
