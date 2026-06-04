'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { notifierPartenaire } from '@/features/notifications/notifier'

const commentaireSchema = z.object({
  content: z.string().min(1).max(500),
})

export async function ajouterCommentaire(memoryId: string, _: unknown, formData: FormData) {
  const donnees = commentaireSchema.safeParse({ content: formData.get('content') })
  if (!donnees.success) return { error: 'Commentaire invalide' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  await supabase.from('comments').insert({
    memory_id: memoryId,
    user_id: user.id,
    content: donnees.data.content,
  })

  const { data: memory } = await supabase
    .from('memories').select('couple_id').eq('id', memoryId).single()
  if (memory) {
    await notifierPartenaire({
      coupleId: memory.couple_id,
      type: 'commentaire',
      detail: donnees.data.content.slice(0, 140),
      link: `/souvenirs/${memoryId}`,
    })
  }

  revalidatePath(`/souvenirs/${memoryId}`)
  return { success: true }
}

export async function supprimerCommentaire(commentaireId: string, memoryId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('comments').delete()
    .eq('id', commentaireId)
    .eq('user_id', user.id)

  revalidatePath(`/souvenirs/${memoryId}`)
}
