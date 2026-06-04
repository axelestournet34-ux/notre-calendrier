'use server'

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
