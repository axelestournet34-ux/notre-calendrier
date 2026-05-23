'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null

export function usePwaInstall() {
  const [pret, setPret] = useState(false)
  const [installe, setInstalle] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalle(true)
      return
    }
    if (deferred) { setPret(true); return }
    const handler = (e: Event) => {
      e.preventDefault()
      deferred = e as BeforeInstallPromptEvent
      setPret(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function installer() {
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') { deferred = null; setInstalle(true) }
  }

  return { pret, installe, installer }
}

export function BoutonInstaller({ className }: { className?: string }) {
  const { pret, installe, installer } = usePwaInstall()
  if (installe || !pret) return null

  return (
    <button
      onClick={installer}
      className={className}
    >
      <Download size={18} className="shrink-0 text-text-muted" />
      <span>Installer l&apos;app</span>
    </button>
  )
}
