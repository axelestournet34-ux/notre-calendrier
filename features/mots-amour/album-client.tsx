'use client'

import { useRef, useState, useTransition } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ImagePlus, X, Plus, Trash2, Send } from 'lucide-react'
import { ajouterMotAmour, supprimerMotAmour } from './actions'
import { cn } from '@/utils/cn'

type Photo = { id: string; url: string | null }
type Mot = {
  id: string
  content: string
  created_at: string
  photos: Photo[]
}

interface Props {
  mots: Mot[]
  estMon: boolean
  titrePour: string
  couleur: 'rose' | 'lavande'
}

const PALETTES = {
  rose: {
    bg: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30',
    border: 'border-rose-200 dark:border-rose-800',
    header: 'from-primary-light to-rose-100 dark:from-primary-light dark:to-rose-950/30',
    emoji: '🌹',
    btn: 'bg-primary hover:bg-primary-hover text-white',
  },
  lavande: {
    bg: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    header: 'from-purple-100 to-violet-100 dark:from-purple-950/30 dark:to-violet-950/30',
    emoji: '💜',
    btn: 'bg-purple-500 hover:bg-purple-600 text-white',
  },
}

const BG_CARDS = [
  'bg-rose-50 dark:bg-rose-950/20',
  'bg-pink-50 dark:bg-pink-950/20',
  'bg-orange-50 dark:bg-orange-950/20',
  'bg-purple-50 dark:bg-purple-950/20',
  'bg-amber-50 dark:bg-amber-950/20',
]

export function AlbumClient({ mots, estMon, titrePour, couleur }: Props) {
  const palette = PALETTES[couleur]
  const [showForm, setShowForm] = useState(false)
  const [fichiers, setFichiers] = useState<{ file: File; url: string }[]>([])
  const [erreur, setErreur] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function ajouterFichiers(e: React.ChangeEvent<HTMLInputElement>) {
    const nouveaux = Array.from(e.target.files ?? []).map(f => ({ file: f, url: URL.createObjectURL(f) }))
    setFichiers(prev => [...prev, ...nouveaux].slice(0, 6))
    e.target.value = ''
  }

  function supprimerFichier(i: number) {
    setFichiers(prev => { URL.revokeObjectURL(prev[i].url); return prev.filter((_, j) => j !== i) })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErreur(null)
    const fd = new FormData(e.currentTarget)
    fd.delete('photos')
    fichiers.forEach(({ file }) => fd.append('photos', file))

    startTransition(async () => {
      const result = await ajouterMotAmour(null, fd)
      if (result?.error) {
        setErreur(result.error)
      } else {
        setFichiers([])
        setShowForm(false)
        formRef.current?.reset()
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* En-tête album */}
      <div className={cn('rounded-2xl border p-5 bg-gradient-to-br', palette.header, palette.border)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-serif font-semibold text-text">
              {palette.emoji} {titrePour}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {mots.length} mot{mots.length > 1 ? 's' : ''} d'amour
            </p>
          </div>
          {estMon && (
            <button
              onClick={() => setShowForm(v => !v)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all', palette.btn)}
            >
              <Plus size={15} />
              Écrire
            </button>
          )}
        </div>
      </div>

      {/* Formulaire */}
      {estMon && showForm && (
        <div className={cn('rounded-2xl border p-4 space-y-3', palette.bg, palette.border)}>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
            <textarea
              name="content"
              rows={4}
              maxLength={1000}
              required
              placeholder="Quelques mots du cœur…"
              className={cn(
                'w-full rounded-xl border border-border bg-white/60 dark:bg-black/20 px-3 py-2.5',
                'text-sm text-text placeholder:text-text-muted resize-none font-serif italic',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'
              )}
            />

            {fichiers.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
                {fichiers.map(({ url }, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => supprimerFichier(i)}
                      className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              {fichiers.length < 6 && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-border text-xs text-text-muted hover:border-primary/50 hover:text-primary transition-all"
                >
                  <ImagePlus size={13} />
                  Ajouter une photo
                </button>
              )}
              <input ref={inputRef} type="file" multiple accept="image/*" onChange={ajouterFichiers} className="hidden" />
              <button
                type="submit"
                disabled={isPending}
                className={cn('ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50', palette.btn)}
              >
                <Send size={14} />
                {isPending ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>

            {erreur && <p className="text-xs text-red-500">{erreur}</p>}
          </form>
        </div>
      )}

      {/* État vide */}
      {mots.length === 0 && (
        <div className={cn('rounded-2xl border p-8 text-center', palette.bg, palette.border)}>
          <p className="text-2xl mb-2">{palette.emoji}</p>
          <p className="text-sm text-text-muted">
            {estMon ? 'Écrivez votre premier mot d\'amour' : 'En attente du premier mot…'}
          </p>
        </div>
      )}

      {/* Liste des mots */}
      <div className="space-y-4">
        {mots.map((mot, idx) => (
          <div
            key={mot.id}
            className={cn('rounded-2xl border p-4 space-y-3 relative group', BG_CARDS[idx % BG_CARDS.length], palette.border)}
          >
            <p className="font-serif text-sm text-text leading-relaxed italic whitespace-pre-wrap">
              « {mot.content} »
            </p>

            {mot.photos.length > 0 && (
              <div className={cn(
                'grid gap-1.5',
                mot.photos.length === 1 ? 'grid-cols-1' :
                mot.photos.length === 2 ? 'grid-cols-2' :
                'grid-cols-3'
              )}>
                {mot.photos.map(p =>
                  p.url ? (
                    <div key={p.id} className={cn('rounded-xl overflow-hidden', mot.photos.length === 1 ? 'aspect-video' : 'aspect-square')}>
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : null
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-text-muted">
                {format(parseISO(mot.created_at), "d MMMM yyyy", { locale: fr })}
              </p>
              {estMon && (
                <button
                  onClick={() => supprimerMotAmour(mot.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
