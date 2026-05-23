'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Header } from '@/components/layout/header'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallerPage() {
  const [plateforme, setPlateforme] = useState<'ios' | 'android' | 'desktop' | null>(null)
  const [installe, setInstalle] = useState(false)
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    if (standalone) { setInstalle(true); return }

    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) setPlateforme('ios')
    else if (/android/.test(ua)) setPlateforme('android')
    else setPlateforme('desktop')

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function installer() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalle(true)
  }

  return (
    <>
      <Header title="Installer l'app" />
      <div className="px-4 py-6 max-w-sm mx-auto space-y-6">

        {/* Aperçu icône */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/icon-192.png"
            alt="Icône de l'app"
            width={96}
            height={96}
            className="rounded-2xl shadow-lg"
          />
          <p className="text-base font-semibold text-text">Nos Souvenirs</p>
          <p className="text-xs text-text-muted">Accède à l&apos;app depuis ton écran d&apos;accueil</p>
        </div>

        {installe && (
          <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-4 text-center">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              ✓ Application déjà installée
            </p>
          </div>
        )}

        {!installe && plateforme === 'ios' && (
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
            <p className="text-sm font-semibold text-text">Sur iPhone / iPad</p>
            <ol className="space-y-3">
              <li className="flex gap-3 items-start">
                <span className="size-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p className="text-sm text-text-soft">Ouvre cette page dans <strong>Safari</strong> (pas Chrome)</p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="size-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p className="text-sm text-text-soft">Appuie sur le bouton <strong>Partager</strong> <span className="inline-block bg-surface-raised rounded px-1">⎙</span> en bas de l&apos;écran</p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="size-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p className="text-sm text-text-soft">Sélectionne <strong>« Sur l&apos;écran d&apos;accueil »</strong></p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="size-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                <p className="text-sm text-text-soft">Appuie sur <strong>Ajouter</strong></p>
              </li>
            </ol>
          </div>
        )}

        {!installe && plateforme === 'android' && (
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
            {prompt ? (
              <button
                onClick={installer}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm"
              >
                Installer l&apos;application
              </button>
            ) : (
              <>
                <p className="text-sm font-semibold text-text">Sur Android</p>
                <ol className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <span className="size-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <p className="text-sm text-text-soft">Ouvre le menu Chrome <strong>⋮</strong></p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="size-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <p className="text-sm text-text-soft">Appuie sur <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong></p>
                  </li>
                </ol>
              </>
            )}
          </div>
        )}

        {!installe && plateforme === 'desktop' && (
          <div className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-sm text-text-muted text-center">
              Ouvre cette page sur ton téléphone pour l&apos;installer.
            </p>
          </div>
        )}

      </div>
    </>
  )
}
