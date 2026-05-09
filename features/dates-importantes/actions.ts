'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const dateSchema = z.object({
  titre: z.string().min(1, 'Titre requis').max(150),
  date: z.string().min(1, 'Date requise'),
  type: z.enum(['anniversaire', 'premiere_rencontre', 'voyage', 'personnalise']),
  recurrent: z.boolean().default(false),
  notes: z.string().max(500).optional(),
})

export async function ajouterDate(_: unknown, formData: FormData) {
  const donnees = dateSchema.safeParse({
    titre: formData.get('titre'),
    date: formData.get('date'),
    type: formData.get('type'),
    recurrent: formData.get('recurrent') === 'on',
    notes: formData.get('notes') || undefined,
  })
  if (!donnees.success) return { error: donnees.error.issues[0]?.message ?? 'Données invalides' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Pas de couple trouvé.' }

  await supabase.from('important_dates').insert({
    couple_id: memberRow.couple_id,
    title: donnees.data.titre,
    date: donnees.data.date,
    type: donnees.data.type,
    recurrent: donnees.data.recurrent,
    notes: donnees.data.notes ?? null,
  })

  revalidatePath('/dates-importantes')
  return { success: true }
}

export async function supprimerDate(dateId: string) {
  const supabase = await createClient()
  await supabase.from('important_dates').delete().eq('id', dateId)
  revalidatePath('/dates-importantes')
}
