'use server'

import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

interface AbonnementInput {
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
}

export async function enregistrerPushSubscription(sub: AbonnementInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Couple introuvable.' }

  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id:    user.id,
    couple_id:  memberRow.couple_id,
    endpoint:   sub.endpoint,
    p256dh:     sub.p256dh,
    auth:       sub.auth,
    user_agent: sub.userAgent ?? null,
  }, { onConflict: 'endpoint' })

  if (error) return { error: 'Impossible d\'activer les notifications.' }
  return { success: true }
}

export async function supprimerPushSubscription(endpoint: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('push_subscriptions').delete()
    .eq('endpoint', endpoint).eq('user_id', user.id)
}

/**
 * Diagnostic : envoie une notif de test à MES propres appareils et remonte
 * les éventuelles erreurs (clé VAPID, abonnement expiré, etc.).
 */
export async function envoyerPushTest(): Promise<{
  ok: number; total: number; erreurs: string[]
} | { error: string }> {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub) return { error: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY absente côté serveur (Vercel).' }
  if (!priv) return { error: 'VAPID_PRIVATE_KEY absente côté serveur (Vercel).' }

  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:contact@notre-calendrier.app', pub, priv)
  } catch {
    return { error: 'Clés VAPID invalides (format incorrect dans Vercel).' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: subs } = await supabase
    .from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('user_id', user.id)
  if (!subs?.length) return { error: 'Aucun appareil abonné — réactive les notifications.' }

  const corps = JSON.stringify({
    title: '🔔 Notification de test',
    body: 'Si tu vois ce message, le push fonctionne ! 💕',
    url: '/dashboard',
    tag: 'test',
  })

  let ok = 0
  const erreurs: string[] = []
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, corps)
      ok++
    } catch (e: unknown) {
      const err = e as { statusCode?: number; body?: string; message?: string }
      erreurs.push(`${err.statusCode ?? '?'} — ${(err.body || err.message || '').toString().slice(0, 120)}`)
      if (err.statusCode === 404 || err.statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', s.id)
      }
    }
  }
  return { ok, total: subs.length, erreurs }
}
