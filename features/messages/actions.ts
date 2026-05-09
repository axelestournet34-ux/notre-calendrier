'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  content: z.string().min(1).max(500),
})

export async function ecrireMessage(_: unknown, formData: FormData) {
  const donnees = schema.safeParse({ content: formData.get('content') })
  if (!donnees.success) return { error: 'Message invalide.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Couple introuvable.' }

  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('daily_messages').insert({
    couple_id: memberRow.couple_id,
    author_id: user.id,
    content: donnees.data.content,
    date: today,
  })

  if (error) return { error: 'Erreur lors de l\'envoi.' }

  revalidatePath('/dashboard')
  return null
}

export async function supprimerMessage(messageId: string) {
  const supabase = await createClient()
  await supabase.from('daily_messages').delete().eq('id', messageId)
  revalidatePath('/dashboard')
}
