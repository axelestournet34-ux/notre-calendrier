import webpush from 'web-push'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type Client = SupabaseClient<Database>

let vapidConfigure = false

function configurerVapid(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return false
  if (!vapidConfigure) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:contact@notre-calendrier.app',
      publicKey,
      privateKey,
    )
    vapidConfigure = true
  }
  return true
}

interface PushPayload {
  title: string
  body?: string
  url?: string
  tag?: string
}

/**
 * Envoie une notification push à tous les appareils d'un utilisateur, en
 * utilisant le client Supabase fourni (SSR côté action, ou admin côté cron).
 * Ne lève jamais : le push est secondaire. Supprime les abonnements expirés.
 */
export async function envoyerPushAvecClient(supabase: Client, userId: string, payload: PushPayload): Promise<void> {
  if (!configurerVapid()) return // push non configuré (clés VAPID absentes)

  try {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', userId)

    if (!subs?.length) return

    const corps = JSON.stringify({
      title: payload.title,
      body: payload.body ?? '',
      url: payload.url ?? '/dashboard',
      tag: payload.tag,
    })

    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            corps,
          )
        } catch (e: unknown) {
          // 404 / 410 → abonnement expiré : on le supprime
          const statut = (e as { statusCode?: number })?.statusCode
          if (statut === 404 || statut === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', s.id)
          }
        }
      }),
    )
  } catch {
    // ignoré
  }
}

/** Envoie un push à un utilisateur depuis une Server Action (client SSR/RLS). */
export async function envoyerPushAu(userId: string, payload: PushPayload): Promise<void> {
  const supabase = await createClient()
  await envoyerPushAvecClient(supabase, userId, payload)
}
