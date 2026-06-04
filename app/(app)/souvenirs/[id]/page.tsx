import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, MapPin, Music } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { DEMO_MEMORIES } from '@/lib/demo-data'

const EMOJIS_TYPE: Record<string, string> = {
  sortie: '🎉', voyage: '✈️', repas: '🍽', anniversaire: '🎂',
  quotidien: '☀️', premiere_fois: '⭐', autre: '♡',
}
const LABELS_TYPE: Record<string, string> = {
  sortie: 'Sortie', voyage: 'Voyage', repas: 'Repas', anniversaire: 'Anniversaire',
  quotidien: 'Quotidien', premiere_fois: 'Première fois', autre: 'Autre',
}

export function generateStaticParams() {
  return DEMO_MEMORIES.map((m) => ({ id: m.id }))
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function SouvenirPage({ params }: Props) {
  const { id } = await params
  const souvenir = DEMO_MEMORIES.find((m) => m.id === id)
  if (!souvenir) notFound()

  const dateFormatee = format(new Date(souvenir.date), "EEEE d MMMM yyyy", { locale: fr })
  const photos = souvenir.photos.filter((p) => p.media_type !== 'audio')

  return (
    <>
      <Header title={souvenir.title} subtitle={dateFormatee} />

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-5">

        <Link href="/timeline"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors">
          <ArrowLeft size={14} />
          Retour à la timeline
        </Link>

        <Card className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{EMOJIS_TYPE[souvenir.type] ?? '♡'}</span>
            <div>
              <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full">
                {LABELS_TYPE[souvenir.type] ?? 'Souvenir'}
              </span>
              <p className="text-xs text-text-muted mt-1">
                Par {souvenir.author_name} · {format(new Date(souvenir.date), "d MMM yyyy", { locale: fr })}
              </p>
            </div>
          </div>

          {souvenir.lieu && (
            <div className="flex items-center gap-1.5 text-sm text-text-soft border-t border-border pt-3">
              <MapPin size={13} className="text-primary shrink-0" />
              <span>{souvenir.lieu}</span>
              <a
                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(souvenir.lieu)}`}
                target="_blank" rel="noopener noreferrer"
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
              <a href={souvenir.chanson_url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate">
                {souvenir.chanson_url.includes('youtube') ? '▶ Écouter sur YouTube' : 'Notre chanson →'}
              </a>
            </div>
          )}
        </Card>

        {/* Réactions (démo) */}
        <Card className="flex gap-4">
          {[
            { emoji: '❤️', label: 'coeur', count: 2 },
            { emoji: '😂', label: 'rire', count: 1 },
            { emoji: '⭐', label: 'etoile', count: 3 },
            { emoji: '🥺', label: 'nostalgie', count: 1 },
          ].map((r) => (
            <button key={r.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-light text-sm font-medium text-primary">
              <span>{r.emoji}</span>
              <span>{r.count}</span>
            </button>
          ))}
        </Card>

        {/* Photos */}
        {photos.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-text">{photos.length} photo{photos.length > 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 gap-2">
              {photos.map((media) => (
                <div key={media.id} className="aspect-square rounded-xl overflow-hidden bg-surface-raised">
                  <img
                    src={media.url}
                    alt={media.caption ?? souvenir.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commentaires (démo) */}
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-text">Commentaires</p>
          <div className="space-y-3">
            {[
              { auteur: 'Emma', texte: 'Ce souvenir me fait tellement sourire ♡', date: '2024-03-01' },
              { auteur: 'Thomas', texte: 'Un de mes préférés ♡', date: '2024-03-02' },
            ].map((c, i) => (
              <div key={i} className="flex gap-2">
                <div className="size-7 rounded-full bg-primary-light flex items-center justify-center text-xs font-medium text-primary shrink-0">
                  {c.auteur[0]}
                </div>
                <div className="bg-surface-raised rounded-xl px-3 py-2 flex-1">
                  <p className="text-xs font-medium text-text">{c.auteur}</p>
                  <p className="text-sm text-text-soft">{c.texte}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </>
  )
}
