'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, X, ExternalLink, Play } from 'lucide-react'
import { cn } from '@/utils/cn'

type Photo = {
  id: string; url: string; caption: string | null
  memoryId: string; memoryTitle: string; storagePath: string
  mediaType: string
}

interface Props {
  photos: Photo[]
  titre: string
  navPrecedent: string
  navSuivant: string
  moisPrecedentLabel: string
  moisSuivantLabel: string
}

export function GalerieClient({
  photos, titre, navPrecedent, navSuivant, moisPrecedentLabel, moisSuivantLabel
}: Props) {
  const [photoActive, setPhotoActive] = useState<number | null>(null)
  const [slideshow, setSlideshow] = useState(false)

  // Diaporama : avance toutes les 3 secondes
  useEffect(() => {
    if (!slideshow || photos.length <= 1) return
    const timer = setInterval(() => {
      setPhotoActive((prev) => {
        if (prev === null) return 0
        return prev === photos.length - 1 ? 0 : prev + 1
      })
    }, 3000)
    return () => clearInterval(timer)
  }, [slideshow, photos.length])

  // Arrête le diaporama si la lightbox est fermée
  useEffect(() => {
    if (photoActive === null) setSlideshow(false)
  }, [photoActive])

  function precedente() {
    if (photoActive === null) return
    setPhotoActive(photoActive === 0 ? photos.length - 1 : photoActive - 1)
  }

  function suivante() {
    if (photoActive === null) return
    setPhotoActive(photoActive === photos.length - 1 ? 0 : photoActive + 1)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') precedente()
    if (e.key === 'ArrowRight') suivante()
    if (e.key === 'Escape') setPhotoActive(null)
  }

  function lancerDiaporama() {
    setPhotoActive(0)
    setSlideshow(true)
  }

  const photo = photoActive !== null ? photos[photoActive] : null

  return (
    <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto w-full space-y-4">

      {/* Navigation mois */}
      <div className="flex items-center justify-between">
        <Link
          href={navPrecedent}
          className="flex items-center gap-1.5 text-sm text-text-soft hover:text-text transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-raised"
        >
          <ChevronLeft size={16} />
          {moisPrecedentLabel}
        </Link>
        <h2 className="text-base font-semibold text-text capitalize">{titre}</h2>
        <Link
          href={navSuivant}
          className="flex items-center gap-1.5 text-sm text-text-soft hover:text-text transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-raised"
        >
          {moisSuivantLabel}
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Compteur + diaporama */}
      {photos.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            {photos.length} photo{photos.length > 1 ? 's' : ''}
          </p>
          {photos.length > 1 && (
            <button
              onClick={lancerDiaporama}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Play size={12} />
              Diaporama
            </button>
          )}
        </div>
      )}

      {/* État vide */}
      {photos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="size-16 rounded-full bg-primary-light flex items-center justify-center text-3xl">🖼</div>
          <p className="text-sm text-text-muted text-center">
            Aucune photo ce mois-ci.<br />
            Ajoutez des souvenirs avec des photos !
          </p>
        </div>
      )}

      {/* Mosaïque */}
      {photos.length > 0 && (
        <div className={cn(
          'grid gap-1.5',
          photos.length === 1 ? 'grid-cols-1' :
          photos.length === 2 ? 'grid-cols-2' :
          photos.length === 3 ? 'grid-cols-3' :
          'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        )}>
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPhotoActive(i)}
              className={cn(
                'relative overflow-hidden rounded-xl bg-surface-raised group cursor-pointer',
                photos.length === 1 ? 'aspect-video max-h-96' : 'aspect-square',
                i === 0 && photos.length === 3 ? 'col-span-2 row-span-2' : ''
              )}
            >
              {p.mediaType === 'video' ? (
                <video src={p.url} muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img
                  src={p.url}
                  alt={p.caption ?? p.memoryTitle}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              {p.mediaType === 'video' && (
                <div className="absolute bottom-2 left-2 bg-black/60 rounded-md px-2 py-0.5 flex items-center gap-1">
                  <svg className="w-3 h-3 text-white fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  <span className="text-[10px] text-white">Vidéo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {photo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPhotoActive(null)}
          onKeyDown={onKeyDown}
          tabIndex={0}
        >
          {/* Bouton fermer */}
          <button
            className="absolute top-4 right-4 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setPhotoActive(null)}
          >
            <X size={20} />
          </button>

          {/* Bouton diaporama */}
          {photos.length > 1 && (
            <button
              className={cn(
                'absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors',
                slideshow
                  ? 'bg-primary/80 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              )}
              onClick={(e) => { e.stopPropagation(); setSlideshow((v) => !v) }}
            >
              <Play size={12} />
              {slideshow ? 'Arrêter' : 'Diaporama'}
            </button>
          )}

          {/* Navigation */}
          {photos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); precedente() }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); suivante() }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Image/Vidéo */}
          <div
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {photo.mediaType === 'video' ? (
              <video
                src={photo.url}
                controls
                playsInline
                className="max-h-[75vh] max-w-full rounded-xl"
              />
            ) : (
              <img
                src={photo.url}
                alt={photo.caption ?? photo.memoryTitle}
                className="max-h-[75vh] max-w-full object-contain rounded-xl"
              />
            )}

            {/* Légende + lien souvenir */}
            <div className="mt-3 text-center space-y-1">
              {photo.caption && (
                <p className="text-sm text-white/80">{photo.caption}</p>
              )}
              <Link
                href={`/souvenirs/${photo.memoryId}`}
                className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
                onClick={() => setPhotoActive(null)}
              >
                <ExternalLink size={12} />
                {photo.memoryTitle}
              </Link>
            </div>

            {/* Indicateur position */}
            {photos.length > 1 && (
              <div className="flex gap-1 mt-3">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoActive(i)}
                    className={cn(
                      'size-1.5 rounded-full transition-all',
                      i === photoActive ? 'bg-white w-4' : 'bg-white/40'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
