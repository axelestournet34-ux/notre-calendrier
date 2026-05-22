'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const creerCoupleSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100),
  dateDebut: z.string().optional(),
})

export async function creerCouple(_: unknown, formData: FormData) {
  const donnees = creerCoupleSchema.safeParse({
    nom: formData.get('nom'),
    dateDebut: formData.get('dateDebut') || undefined,
  })

  if (!donnees.success) {
    return { error: donnees.error.issues[0]?.message ?? 'Données invalides' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  // UUID pré-généré côté serveur : évite le SELECT post-insert bloqué par RLS
  // (l'utilisateur n'est pas encore membre au moment de l'insert)
  const coupleId = crypto.randomUUID()

  const { error: erreurCouple } = await supabase
    .from('couples')
    .insert({
      id: coupleId,
      name: donnees.data.nom,
      start_date: donnees.data.dateDebut ?? null,
    })

  if (erreurCouple) {
    return { error: 'Erreur lors de la création du couple.' }
  }

  const { error: erreurMembre } = await supabase
    .from('couple_members')
    .insert({ couple_id: coupleId, user_id: user.id, role: 'owner' })

  if (erreurMembre) {
    return { error: 'Erreur lors de l\'association au couple.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function genererInvitation(coupleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data, error } = await supabase
    .from('couple_invitations')
    .insert({ couple_id: coupleId, invited_by: user.id })
    .select('token')
    .single()

  if (error || !data) return { error: 'Erreur génération invitation' }

  return { token: data.token }
}

export async function rejoindreAvecCode(_: unknown, formData: FormData) {
  const code = (formData.get('code') as string ?? '').trim().toUpperCase()

  if (code.length !== 8) {
    return { error: 'Le code doit contenir 8 caractères.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: invitation } = await supabase
    .from('couple_invitations')
    .select('*')
    .ilike('token', code.toLowerCase() + '%')
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invitation) return { error: 'Code invalide ou expiré.' }

  const { data: dejaMembreCouple } = await supabase
    .from('couple_members')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (dejaMembreCouple) return { error: 'Vous appartenez déjà à un couple.' }

  await supabase
    .from('couple_members')
    .insert({ couple_id: invitation.couple_id, user_id: user.id, role: 'member' })

  await supabase
    .from('couple_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function accepterInvitation(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: invitation } = await supabase
    .from('couple_invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invitation) return { error: 'Invitation invalide ou expirée.' }

  const { data: dejaMembreCouple } = await supabase
    .from('couple_members')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (dejaMembreCouple) return { error: 'Vous appartenez déjà à un couple.' }

  await supabase
    .from('couple_members')
    .insert({ couple_id: invitation.couple_id, user_id: user.id, role: 'member' })

  await supabase
    .from('couple_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
