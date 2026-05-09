'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const capsuleSchema = z.object({
  titre: z.string().min(1, 'Titre requis').max(200),
  contenu: z.string().min(1, 'Message requis').max(5000),
  dateOuverture: z.string().min(1, 'Date d\'ouverture requise'),
})

export async function ajouterCapsule(_: unknown, formData: FormData) {
  const donnees = capsuleSchema.safeParse({
    titre: formData.get('titre'),
    contenu: formData.get('contenu'),
    dateOuverture: formData.get('dateOuverture'),
  })
  if (!donnees.success) return { error: donnees.error.issues[0]?.message ?? 'Données invalides' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Pas de couple trouvé.' }

  if (new Date(donnees.data.dateOuverture) <= new Date()) {
    return { error: 'La date d\'ouverture doit être dans le futur.' }
  }

  await supabase.from('time_capsules').insert({
    couple_id: memberRow.couple_id,
    created_by: user.id,
    title: donnees.data.titre,
    content: donnees.data.contenu,
    open_date: donnees.data.dateOuverture,
  })

  revalidatePath('/capsules')
  return { success: true }
}

export async function ouvrirCapsule(capsuleId: string) {
  const supabase = await createClient()
  await supabase.from('time_capsules')
    .update({ opened_at: new Date().toISOString() })
    .eq('id', capsuleId)
  revalidatePath('/capsules')
}
