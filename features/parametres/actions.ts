'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { genererInvitation } from '@/features/couple/actions'

const profilSchema = z.object({
  prenom: z.string().min(1, 'Prénom requis').max(50),
})

const coupleSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100),
  dateDebut: z.string().optional(),
})

export async function mettreAJourProfil(_: unknown, formData: FormData) {
  const donnees = profilSchema.safeParse({ prenom: formData.get('prenom') })
  if (!donnees.success) return { error: donnees.error.issues[0]?.message ?? 'Données invalides' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  await supabase.from('profiles').update({ full_name: donnees.data.prenom }).eq('id', user.id)

  revalidatePath('/', 'layout')
  return { success: 'Profil mis à jour.' }
}

export async function mettreAJourCouple(_: unknown, formData: FormData) {
  const donnees = coupleSchema.safeParse({
    nom: formData.get('nom'),
    dateDebut: formData.get('dateDebut') || undefined,
  })
  if (!donnees.success) return { error: donnees.error.issues[0]?.message ?? 'Données invalides' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Pas de couple trouvé.' }

  await supabase.from('couples').update({
    name: donnees.data.nom,
    start_date: donnees.data.dateDebut ?? null,
  }).eq('id', memberRow.couple_id)

  revalidatePath('/', 'layout')
  return { success: 'Couple mis à jour.' }
}

export async function creerLienInvitation(coupleId: string) {
  return genererInvitation(coupleId)
}
