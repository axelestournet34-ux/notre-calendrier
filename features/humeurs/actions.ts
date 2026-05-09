'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type MoodType = 'heureux' | 'amoureux' | 'fatigue' | 'stresse' | 'nostalgique' | 'excite'

export async function changerHumeur(mood: MoodType) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Couple introuvable.' }

  const today = new Date().toISOString().split('T')[0]

  await supabase.from('daily_moods').upsert({
    couple_id: memberRow.couple_id,
    user_id: user.id,
    mood,
    date: today,
  }, { onConflict: 'user_id,date' })

  revalidatePath('/dashboard')
}
