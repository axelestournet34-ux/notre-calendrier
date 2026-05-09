'use client'

import { useRef, useState } from 'react'
import { Mic, Square, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Props {
  onAudio: (file: File | null) => void
}

export function EnregistreurAudio({ onAudio }: Props) {
  const [enregistrement, setEnregistrement] = useState(false)
  const [duree, setDuree] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function commencer() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], `note-vocale-${Date.now()}.webm`, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        onAudio(file)
      }

      recorder.start()
      setEnregistrement(true)
      setDuree(0)
      timerRef.current = setInterval(() => setDuree((d) => d + 1), 1000)
    } catch {
      alert('Accès au microphone refusé.')
    }
  }

  function arreter() {
    recorderRef.current?.stop()
    setEnregistrement(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function supprimer() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setDuree(0)
    onAudio(null)
  }

  function formatDuree(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  }

  if (audioUrl) {
    return (
      <div className="flex items-center gap-3 p-3 bg-surface-raised rounded-xl border border-border">
        <audio src={audioUrl} controls className="flex-1 h-8" style={{ minWidth: 0 }} />
        <button
          type="button"
          onClick={supprimer}
          className="text-text-muted hover:text-red-500 transition-colors shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={enregistrement ? arreter : commencer}
      className={cn(
        'w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-dashed transition-all',
        enregistrement
          ? 'border-red-400 bg-red-50 dark:bg-red-950/20 text-red-500'
          : 'border-border text-text-muted hover:border-primary/50 hover:text-primary hover:bg-primary-light/30'
      )}
    >
      {enregistrement ? (
        <>
          <div className="size-2 rounded-full bg-red-500 animate-pulse" />
          <Square size={16} />
          <span className="text-sm font-medium">Arrêter · {formatDuree(duree)}</span>
        </>
      ) : (
        <>
          <Mic size={18} />
          <span className="text-sm">Enregistrer une note vocale</span>
        </>
      )}
    </button>
  )
}
