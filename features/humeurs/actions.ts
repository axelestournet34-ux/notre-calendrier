'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { notifierPartenaire } from '@/features/notifications/notifier'

export type MoodType = 'heureux' | 'amoureux' | 'fatigue' | 'stresse' | 'nostalgique' | 'excite'

const labelHumeur: Record<MoodType, string> = {
  heureux:     'Heureux·se 😊',
  amoureux:    'Amoureux·se 🥰',
  fatigue:     'Fatigué·e 😴',
  stresse:     'Stressé·e 😣',
  nostalgique: 'Nostalgique 🥹',
  excite:      'Excité·e 🤩',
}

export async function changerHumeur(mood: MoodType) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Couple introuvable.' }

  const today = new Date().toISOString().split('T')[0]

  // Humeur déjà postée aujourd'hui ? (pour ne notifier qu'une fois par jour)
  const { data: existant } = await supabase
    .from('daily_moods').select('id').eq('user_id', user.id).eq('date', today).maybeSingle()

  await supabase.from('daily_moods').upsert({
    couple_id: memberRow.couple_id,
    user_id: user.id,
    mood,
    date: today,
  }, { onConflict: 'user_id,date' })

  if (!existant) {
    await notifierPartenaire({
      coupleId: memberRow.couple_id,
      type: 'humeur',
      detail: labelHumeur[mood],
      link: '/dashboard',
    })
  }

  revalidatePath('/dashboard')
}
