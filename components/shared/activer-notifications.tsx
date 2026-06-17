'use client'

import { useEffect, useState } from 'react'
import { Bell, BellRing, BellOff } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  enregistrerPushSubscription,
  supprimerPushSubscription,
  envoyerPushTest,
} from '@/features/notifications/push-actions'

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const buffer = new ArrayBuffer(raw.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i)
  return view
}

type Etat = 'inconnu' | 'non_supporte' | 'refuse' | 'inactif' | 'actif' | 'chargement'

export function ActiverNotifications() {
  const [etat, setEtat] = useState<Etat>('inconnu')

  useEffect(() => {
    let actif = true

    async function detecter(): Promise<Etat> {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        return 'non_supporte'
      }
      if (Notification.permission === 'denied') return 'refuse'
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        return sub ? 'actif' : 'inactif'
      } catch {
        return 'inactif'
      }
    }

    detecter().then((e) => { if (actif) setEtat(e) })
    return () => { actif = false }
  }, [])

  async function activer() {
    const cle = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!cle) {
      toast.error('Les notifications push ne sont pas configurées (clé VAPID manquante).')
      return
    }
    setEtat('chargement')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Tu as refusé les notifications.')
        setEtat(permission === 'denied' ? 'refuse' : 'inactif')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(cle),
      })

      const json = sub.toJSON()
      const res = await enregistrerPushSubscription({
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh ?? '',
        auth: json.keys?.auth ?? '',
        userAgent: navigator.userAgent,
      })

      if (res?.error) {
        toast.error(res.error)
        setEtat('inactif')
        return
      }
      setEtat('actif')
      toast.success('Notifications activées sur cet appareil 🔔')
    } catch {
      toast.error('Impossible d\'activer les notifications.')
      setEtat('inactif')
    }
  }

  async function desactiver() {
    setEtat('chargement')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await supprimerPushSubscription(sub.endpoint)
        await sub.unsubscribe()
      }
      setEtat('inactif')
      toast.success('Notifications désactivées sur cet appareil.')
    } catch {
      setEtat('actif')
      toast.error('Impossible de désactiver les notifications.')
    }
  }

  async function tester() {
    const res = await envoyerPushTest()
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    if (res.ok > 0) {
      toast.success(`Test envoyé à ${res.ok} appareil(s) — tu devrais le recevoir dans quelques secondes.`)
    } else {
      toast.error(`Échec de l'envoi : ${res.erreurs[0] ?? 'erreur inconnue'}`)
    }
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
          <BellRing size={18} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text">Notifications push</p>
          <p className="text-xs text-text-muted mt-0.5">
            Être prévenu(e) sur cet appareil quand ton/ta partenaire ajoute un souvenir, un message…
          </p>
        </div>
      </div>

      {etat === 'non_supporte' && (
        <p className="text-xs text-text-muted bg-surface-raised rounded-xl px-3 py-2.5">
          Cet appareil ne supporte pas les notifications push.{' '}
          <span className="text-text-soft">
            Sur iPhone, installe d&apos;abord l&apos;app sur l&apos;écran d&apos;accueil
            (Partager → « Sur l&apos;écran d&apos;accueil »), puis rouvre cette page.
          </span>
        </p>
      )}

      {etat === 'refuse' && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2.5">
          Les notifications sont bloquées. Autorise-les dans les réglages du navigateur pour ce site.
        </p>
      )}

      {(etat === 'inactif' || etat === 'inconnu') && (
        <Button
          onClick={activer}
          loading={etat === 'inconnu'}
          icon={<Bell size={16} />}
          className="w-full"
        >
          Activer sur cet appareil
        </Button>
      )}

      {etat === 'chargement' && (
        <Button loading className="w-full">Patiente…</Button>
      )}

      {etat === 'actif' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 bg-surface-raised rounded-xl px-3 py-2.5">
            <p className="text-sm text-text-soft flex items-center gap-2">
              <BellRing size={15} className="text-primary" /> Activées sur cet appareil
            </p>
            <button
              onClick={desactiver}
              className="text-xs text-text-muted hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <BellOff size={13} /> Désactiver
            </button>
          </div>
          <Button onClick={tester} variant="secondary" icon={<Bell size={15} />} className="w-full">
            M&apos;envoyer une notif de test
          </Button>
        </div>
      )}
    </Card>
  )
}
