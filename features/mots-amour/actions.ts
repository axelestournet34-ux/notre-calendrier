'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { uploadToR2, deleteFromR2 } from '@/lib/r2'

const schema = z.object({
  content: z.string().min(1, 'Écrivez quelque chose ♡').max(1000),
})

export async function ajouterMotAmour(_: unknown, formData: FormData) {
  const donnees = schema.safeParse({ content: formData.get('content') })
  if (!donnees.success) return { error: donnees.error.issues[0]?.message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Couple introuvable.' }

  const { data: mot, error } = await supabase
    .from('mots_amour')
    .insert({ couple_id: memberRow.couple_id, author_id: user.id, content: donnees.data.content })
    .select('id')
    .single()

  if (error || !mot) return { error: 'Erreur lors de l\'enregistrement.' }

  const fichiers = formData.getAll('photos') as File[]
  const valides = fichiers.filter(f => f.size > 0)

  for (let i = 0; i < valides.length; i++) {
    const f = valides[i]
    const ext = f.name.split('.').pop() ?? 'jpg'
    const chemin = `mots-amour/${memberRow.couple_id}/${mot.id}/${Date.now()}-${i}.${ext}`
    try {
      await uploadToR2(chemin, f)
      await supabase.from('mots_amour_photos').insert({ mot_id: mot.id, storage_path: chemin, sort_order: i })
    } catch { }
  }

  revalidatePath('/mots-amour')
  return null
}

export async function supprimerMotAmour(motId: string) {
  const supabase = await createClient()

  const { data: photos } = await supabase
    .from('mots_amour_photos').select('storage_path').eq('mot_id', motId)

  await Promise.all((photos ?? []).map(p => deleteFromR2(p.storage_path)))

  await supabase.from('mots_amour').delete().eq('id', motId)
  revalidatePath('/mots-amour')
}
