'use client'

import { useEffect, useState } from 'react'
import { X, Share, Plus } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstall() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    if (standalone) return

    if (ios) {
      const deja = localStorage.getItem('pwa-ios-dismiss')
      if (!deja) {
        setIsIos(true)
        setVisible(true)
      }
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
      const deja = localStorage.getItem('pwa-dismiss')
      if (!deja) setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function fermer() {
    setVisible(false)
    localStorage.setItem(isIos ? 'pwa-ios-dismiss' : 'pwa-dismiss', '1')
  }

  async function installer() {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-surface border border-border rounded-2xl shadow-xl p-4 flex gap-3 items-start">
        <img src="/catoune.jpg" alt="icône" className="size-12 rounded-xl object-cover shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text">Installer l&apos;application</p>

          {isIos ? (
            <p className="text-xs text-text-muted mt-1">
              Appuie sur <Share size={11} className="inline mb-0.5" /> puis{' '}
              <strong>« Sur l&apos;écran d&apos;accueil »</strong>
            </p>
          ) : (
            <p className="text-xs text-text-muted mt-1">
              Ajoute l&apos;app sur ton téléphone pour y accéder facilement.
            </p>
          )}

          {!isIos && (
            <button
              onClick={installer}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-primary"
            >
              <Plus size={13} /> Installer
            </button>
          )}
        </div>

        <button onClick={fermer} className="text-text-muted hover:text-text shrink-0 p-0.5">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
