'use client'

import { useRef, useState, useTransition } from 'react'
import { format } from 'date-fns'
import { ImagePlus, X, Film } from 'lucide-react'
import { ajouterSouvenir, obtenirUrlUpload } from '@/features/memories/actions'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EnregistreurAudio } from '@/components/shared/enregistreur-audio'
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

type Fichier = { file: File; url: string; estVideo: boolean }

export default function NouveauSouvenirPage() {
  const [typeChoisi, setTypeChoisi] = useState<MemoryType>('autre')
  const [fichiers, setFichiers] = useState<Fichier[]>([])
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function ajouterFichiers(e: React.ChangeEvent<HTMLInputElement>) {
    const nouveaux = Array.from(e.target.files ?? []).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      estVideo: file.type.startsWith('video/'),
    }))
    setFichiers((prev) => [...prev, ...nouveaux].slice(0, 50))
    e.target.value = ''
  }

  function supprimerFichier(index: number) {
    setFichiers((prev) => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErreur(null)
    const form = e.currentTarget

    startTransition(async () => {
      const formData = new FormData(form)
      formData.delete('medias')

      const tousLesFichiers: { file: File; estVideo: boolean; estAudio: boolean }[] = [
        ...fichiers.map(f => ({ file: f.file, estVideo: f.estVideo, estAudio: false })),
        ...(audioFile ? [{ file: audioFile, estVideo: false, estAudio: true }] : []),
      ]

      for (const { file, estVideo, estAudio } of tousLesFichiers) {
        const mediaType = estVideo ? 'video' : estAudio ? 'audio' : 'photo'
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

      const result = await ajouterSouvenir(null, formData)
      if (result?.error) setErreur(result.error)
    })
  }

  return (
    <>
      <Header title="Nouveau souvenir" subtitle="Capturez un moment" />

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full">
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
            <Input label="Titre" name="titre" type="text" placeholder="Un beau moment..." required />
            <Input label="Date" name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required />
          </div>

          {/* Lieu */}
          <Input label="Lieu (optionnel)" name="lieu" type="text" placeholder="Paris, Barcelone, chez nous..." />

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Note (optionnel)</label>
            <textarea
              name="note"
              rows={4}
              placeholder="Racontez ce moment..."
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
              placeholder="Une phrase dite ce jour-là…"
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
            placeholder="Lien Spotify, YouTube, Apple Music…"
          />

          {/* Photos & Vidéos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text">Photos & vidéos</label>
              {fichiers.length > 0 && (
                <span className="text-xs text-text-muted">{fichiers.length} / 50</span>
              )}
            </div>

            {fichiers.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {fichiers.map(({ url, estVideo }, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface-raised group">
                    {estVideo ? (
                      <video src={url} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    )}
                    {estVideo && (
                      <div className="absolute bottom-1 left-1 bg-black/60 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                        <Film size={10} className="text-white" />
                        <span className="text-[10px] text-white">Vidéo</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => supprimerFichier(i)}
                      className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {fichiers.length < 50 && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={cn(
                  'w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-border',
                  'text-text-muted hover:border-primary/50 hover:text-primary hover:bg-primary-light/30',
                  'transition-all duration-150 cursor-pointer'
                )}
              >
                <ImagePlus size={22} />
                <span className="text-sm">Ajouter des photos ou vidéos</span>
                <span className="text-xs text-text-muted">JPG, PNG, HEIC, MP4, MOV — max 100 Mo</span>
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

          {/* Note vocale */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Note vocale (optionnel)</label>
            <EnregistreurAudio
              onAudio={(file) => setAudioFile(file)}
            />
          </div>

          {erreur && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
              {erreur}
            </p>
          )}

          <Button type="submit" loading={isPending} className="w-full">
            Enregistrer le souvenir
          </Button>
        </form>
      </div>
    </>
  )
}
