'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { cn } from '@/utils/cn'

type Media = { id: string; url: string; caption: string | null; mediaType: string }

/**
 * Affiche les photos/vidéos d'un souvenir SANS les recadrer (mosaïque verticale,
 * une colonne sur mobile, deux sur desktop). Un clic ouvre la photo en grand
 * (lightbox, image entière). Les vidéos se lisent directement dans la mosaïque.
 */
export function SouvenirGalerie({ medias, titre }: { medias: Media[]; titre: string }) {
  const photos = medias.filter((m) => m.mediaType === 'photo')
  const [actif, setActif] = useState<number | null>(null) // index dans `photos`

  function ouvrir(photoId: string) {
    const i = photos.findIndex((p) => p.id === photoId)
    if (i >= 0) setActif(i)
  }
  function precedente() {
    setActif((p) => (p === null ? null : p === 0 ? photos.length - 1 : p - 1))
  }
  function suivante() {
    setActif((p) => (p === null ? null : p === photos.length - 1 ? 0 : p + 1))
  }

  const photo = actif !== null ? photos[actif] : null

  return (
    <>
      {/* Mosaïque : médias entiers, non recadrés */}
      <div className="columns-1 sm:columns-2 gap-2">
        {medias.map((m) => (
          <div key={m.id} className="mb-2 break-inside-avoid">
            {m.mediaType === 'video' ? (
              <video
                src={m.url}
                controls
                playsInline
                className="block w-full rounded-xl bg-black"
              />
            ) : (
              <button
                type="button"
                onClick={() => ouvrir(m.id)}
                className="block w-full relative group rounded-xl overflow-hidden bg-surface-raised"
              >
                <img src={m.url} alt={m.caption ?? titre} className="w-full h-auto" />
                <span className="absolute top-2 right-2 size-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={14} />
                </span>
              </button>
            )}
            {m.caption && <p className="mt-1 px-0.5 text-xs text-text-muted">{m.caption}</p>}
          </div>
        ))}
      </div>

      {/* Lightbox photo entière */}
      {photo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActif(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setActif(null)
            if (e.key === 'ArrowLeft') precedente()
            if (e.key === 'ArrowRight') suivante()
          }}
          tabIndex={0}
        >
          <button
            className="absolute top-4 right-4 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setActif(null)}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>

          {photos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); precedente() }}
                aria-label="Photo précédente"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); suivante() }}
                aria-label="Photo suivante"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photo.url}
              alt={photo.caption ?? titre}
              className="max-h-[80vh] max-w-full object-contain rounded-xl"
            />
            {photo.caption && <p className="mt-3 text-sm text-white/80 text-center">{photo.caption}</p>}
            {photos.length > 1 && (
              <div className="flex gap-1 mt-3">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActif(i)}
                    className={cn('size-1.5 rounded-full transition-all', i === actif ? 'bg-white w-4' : 'bg-white/40')}
                    aria-label={`Photo ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
