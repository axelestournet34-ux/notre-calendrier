'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function ajouterArticle(coupleId: string, content: string) {
  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 200) return { error: 'Contenu invalide' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase.from('liste_courses').insert({
    couple_id:  coupleId,
    content:    trimmed,
    created_by: user.id,
  })

  if (error) return { error: 'Erreur lors de l\'ajout.' }

  revalidatePath('/courses')
  return null
}

export async function toggleArticle(id: string, done: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase.from('liste_courses').update({ done }).eq('id', id)
  if (error) return { error: 'Erreur lors de la mise à jour.' }

  revalidatePath('/courses')
  return null
}

export async function supprimerArticle(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase.from('liste_courses').delete().eq('id', id)
  if (error) return { error: 'Erreur lors de la suppression.' }

  revalidatePath('/courses')
  return null
}
