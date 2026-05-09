'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  title:   z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
})

export async function ecrireLettre(_: unknown, formData: FormData) {
  const donnees = schema.safeParse({
    title:   formData.get('title'),
    content: formData.get('content'),
  })
  if (!donnees.success) return { error: donnees.error.issues[0]?.message ?? 'Données invalides.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Couple introuvable.' }

  const { data: lettre, error } = await supabase.from('lettres').insert({
    couple_id: memberRow.couple_id,
    author_id: user.id,
    title: donnees.data.title,
    content: donnees.data.content,
  }).select('id').single()

  if (error || !lettre) return { error: 'Erreur lors de l\'enregistrement.' }

  revalidatePath('/lettre')
  redirect(`/lettre/${lettre.id}`)
}

export async function supprimerLettre(lettreId: string) {
  const supabase = await createClient()
  await supabase.from('lettres').delete().eq('id', lettreId)
  revalidatePath('/lettre')
  redirect('/lettre')
}
