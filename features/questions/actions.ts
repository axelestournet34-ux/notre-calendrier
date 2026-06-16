'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { notifierPartenaire } from '@/features/notifications/notifier'

const schema = z.object({ answer: z.string().min(1).max(1000) })

export async function repondreQuestion(_: unknown, formData: FormData) {
  const donnees = schema.safeParse({ answer: formData.get('answer') })
  if (!donnees.success) return { error: 'Réponse invalide.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Couple introuvable.' }

  const today = new Date().toISOString().split('T')[0]

  // Déjà répondu aujourd'hui ? (pour ne notifier qu'une fois)
  const { data: existant } = await supabase
    .from('daily_question_answers')
    .select('id').eq('user_id', user.id).eq('date', today).maybeSingle()

  const { error } = await supabase
    .from('daily_question_answers')
    .upsert({
      couple_id: memberRow.couple_id,
      user_id: user.id,
      answer: donnees.data.answer,
      date: today,
    }, { onConflict: 'user_id,date' })

  if (error) return { error: 'Erreur lors de l\'enregistrement.' }

  if (!existant) {
    await notifierPartenaire({
      coupleId: memberRow.couple_id,
      type: 'question',
      detail: 'Découvre sa réponse 💭',
      link: '/aujourdhui',
    })
  }

  revalidatePath('/aujourdhui')
  revalidatePath('/dashboard')
  return null
}
