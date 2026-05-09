'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { BucketStatus } from '@/types/database.types'

const itemSchema = z.object({
  titre: z.string().min(1, 'Titre requis').max(200),
  description: z.string().max(1000).optional(),
  plannedDate: z.string().optional(),
})

export async function ajouterItem(_: unknown, formData: FormData) {
  const donnees = itemSchema.safeParse({
    titre: formData.get('titre'),
    description: formData.get('description') || undefined,
    plannedDate: formData.get('plannedDate') || undefined,
  })
  if (!donnees.success) return { error: donnees.error.issues[0]?.message ?? 'Données invalides' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Pas de couple trouvé.' }

  await supabase.from('bucket_list_items').insert({
    couple_id: memberRow.couple_id,
    created_by: user.id,
    title: donnees.data.titre,
    description: donnees.data.description ?? null,
    planned_date: donnees.data.plannedDate ?? null,
  })

  revalidatePath('/bucket-list')
  return { success: true }
}

export async function changerStatut(itemId: string, statut: BucketStatus) {
  const supabase = await createClient()
  await supabase.from('bucket_list_items').update({ status: statut }).eq('id', itemId)
  revalidatePath('/bucket-list')
}

export async function supprimerItem(itemId: string) {
  const supabase = await createClient()
  await supabase.from('bucket_list_items').delete().eq('id', itemId)
  revalidatePath('/bucket-list')
}
