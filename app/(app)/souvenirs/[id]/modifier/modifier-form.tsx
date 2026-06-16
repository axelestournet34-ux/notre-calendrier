'use client'

import { useState, useRef, useTransition } from 'react'
import { ImagePlus, X, Film, Star } from 'lucide-react'
import { modifierSouvenir, obtenirUrlUpload, supprimerPhotoSouvenir, definirCouverturePhoto } from '@/features/memories/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import type { MemoryType } from '@/types/database.types'

const TYPES: { value: MemoryType; label: string; emoji: string }[] = [
  { value: 'sortie',        label: 'Sortie',        emoji: '🎉' },
  { value: 'voyage',        label: 'Voyage',        emoji: '✈️' },
  { value: 'repas',         label: 'Repas',         emoji: '🍽' },
  { value: 'anniversaire',  label: 'Anniversaire',  emoji: '🎂' },
  { value: 'quotidien',     label: 'Quotidien',     emoji: '☀️' },
  { value: 'premiere_fois', label: 'Première fois', emoji: '⭐' },
  { value: 'autre',         label: 'Autre',         emoji: '♡' },
]

type PhotoExistante = { id: string; storagePath: string; mediaType: string; caption: string | null; url: string | null }
type NouveauFichier = { file: File; previewUrl: string; estVideo: boolean }

interface Props {
  souvenir: {
    id: string; title: string; date: string; type: string
    note: string | null; lieu: string | null
    citation: string | null; chanson_url: string | null
  }
  photos: PhotoExistante[]
}

export function ModifierForm({ souvenir, photos: photosInitiales }: Props) {
  const [typeChoisi, setTypeChoisi] = useState<MemoryType>(souvenir.type as MemoryType)
  const [photosExistantes, setPhotosExistantes] = useState(photosInitiales)
  const [nouveauxFichiers, setNouveauxFichiers] = useState<NouveauFichier[]>([])
  const [legendes, setLegendes] = useState<Record<string, string>>(
    () => Object.fromEntries(photosInitiales.map((p) => [p.id, p.caption ?? '']))
  )
  const [erreur, setErreur] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function supprimerExistante(photo: PhotoExistante) {
    await supprimerPhotoSouvenir(photo.id, photo.storagePath)
    setPhotosExistantes(prev => prev.filter(p => p.id !== photo.id))
  }

  async function definirCouverture(photo: PhotoExistante) {
    await definirCouverturePhoto(photo.id, souvenir.id)
    setPhotosExistantes(prev => [photo, ...prev.filter(p => p.id !== photo.id)])
  }

  function ajouterFichiers(e: React.ChangeEvent<HTMLInputElement>) {
    const nouveaux = Array.from(e.target.files ?? []).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      estVideo: file.type.startsWith('video/'),
    }))
    setNouveauxFichiers(prev => [...prev, ...nouveaux].slice(0, 50 - photosExistantes.length))
    e.target.value = ''
  }

  function supprimerNouveau(index: number) {
    setNouveauxFichiers(prev => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErreur(null)
    const form = e.currentTarget

    startTransition(async () => {
      const formData = new FormData(form)
      formData.set('nbPhotosExistantes', String(photosExistantes.length))

      for (const { file, estVideo } of nouveauxFichiers) {
        const mediaType = estVideo ? 'video' : 'photo'
        const res = await obtenirUrlUpload(file.name, file.type)
        if ('error' in res) { setErreur(res.error ?? 'Erreur upload'); return }
        try {
          await fetch(res.url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
          formData.append('chemin', res.chemin)
          formData.append('mediaType', mediaType)
        } catch {
          setErreur('Erreur lors de l\'upload d\'un fichier.')
          return
        }
      }

      // Légendes des photos existantes
      for (const p of photosExistantes) {
        formData.append('legendeId', p.id)
        formData.append('legende', legendes[p.id] ?? '')
      }

      const result = await modifierSouvenir(souvenir.id, null, formData)
      if (result?.error) setErreur(result.error)
    })
  }

  const totalPhotos = photosExistantes.length + nouveauxFichiers.length

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text">Type de souvenir</label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(({ value, label, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTypeChoisi(value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all',
                typeChoisi === value
                  ? 'bg-primary-light border-primary text-primary'
                  : 'bg-surface border-border text-text-soft hover:border-primary/50'
              )}
            >
              <span>{emoji}</span>{label}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={typeChoisi} />
      </div>

      {/* Titre + Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Titre" name="titre" type="text" defaultValue={souvenir.title} required />
        <Input label="Date" name="date" type="date" defaultValue={souvenir.date} required />
      </div>

      {/* Lieu */}
      <Input label="Lieu (optionnel)" name="lieu" type="text" defaultValue={souvenir.lieu ?? ''} placeholder="Paris, Barcelone, chez nous..." />

      {/* Note */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">Note (optionnel)</label>
        <textarea
          name="note"
          rows={4}
          defaultValue={souvenir.note ?? ''}
          className={cn(
            'w-full rounded-xl border border-border bg-surface px-3 py-2.5',
            'text-sm text-text placeholder:text-text-muted resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'
          )}
        />
      </div>

      {/* Citation */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">Citation mémorable (optionnel)</label>
        <textarea
          name="citation"
          rows={2}
          maxLength={500}
          defaultValue={souvenir.citation ?? ''}
          className={cn(
            'w-full rounded-xl border border-border bg-surface px-3 py-2.5',
            'text-sm text-text placeholder:text-text-muted resize-none italic',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'
          )}
        />
      </div>

      {/* Chanson */}
      <Input
        label="Notre chanson (optionnel)"
        name="chanson_url"
        type="url"
        defaultValue={souvenir.chanson_url ?? ''}
        placeholder="Lien Spotify, YouTube, Apple Music…"
      />

      {/* Photos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text">Photos & vidéos</label>
          {totalPhotos > 0 && <span className="text-xs text-text-muted">{totalPhotos} / 50</span>}
        </div>

        {/* Photos existantes : légende + couverture */}
        {photosExistantes.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {photosExistantes.map((p, idx) => (
              <div key={p.id} className="space-y-1.5">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-raised">
                  {p.mediaType === 'video' ? (
                    <video src={p.url ?? ''} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={p.url ?? ''} alt="" className="w-full h-full object-cover" />
                  )}
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                      <Star size={10} className="fill-white" /> Couverture
                    </span>
                  )}
                  {p.mediaType === 'video' && idx !== 0 && (
                    <div className="absolute bottom-1 left-1 bg-black/60 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                      <Film size={10} className="text-white" />
                      <span className="text-[10px] text-white">Vidéo</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => supprimerExistante(p)}
                    className="absolute top-1 right-1 size-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>

                {p.mediaType === 'photo' && (
                  <input
                    type="text"
                    value={legendes[p.id] ?? ''}
                    onChange={(e) => setLegendes(prev => ({ ...prev, [p.id]: e.target.value }))}
                    placeholder="Légende…"
                    maxLength={300}
                    className="w-full rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                )}

                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => definirCouverture(p)}
                    className="flex items-center gap-1 text-[11px] text-text-muted hover:text-primary transition-colors"
                  >
                    <Star size={11} /> Définir comme couverture
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Nouvelles photos (légendables après enregistrement) */}
        {nouveauxFichiers.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {nouveauxFichiers.map(({ previewUrl, estVideo }, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface-raised ring-2 ring-primary/40">
                {estVideo ? (
                  <video src={previewUrl} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => supprimerNouveau(i)}
                  className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {totalPhotos < 50 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'w-full flex flex-col items-center gap-2 py-5 rounded-xl border-2 border-dashed border-border',
              'text-text-muted hover:border-primary/50 hover:text-primary hover:bg-primary-light/30',
              'transition-all duration-150 cursor-pointer'
            )}
          >
            <ImagePlus size={20} />
            <span className="text-sm">Ajouter des photos ou vidéos</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/quicktime,video/webm"
          onChange={ajouterFichiers}
          className="hidden"
        />
      </div>

      {erreur && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
          {erreur}
        </p>
      )}

      <Button type="submit" loading={isPending} className="w-full">
        Enregistrer les modifications
      </Button>
    </form>
  )
}
