'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const connexionSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(6, 'Mot de passe trop court'),
})

const inscriptionSchema = z.object({
  prenom: z.string().min(1, 'Prénom requis').max(50),
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(8, 'Au moins 8 caractères'),
})

export async function seConnecter(_: unknown, formData: FormData) {
  const donnees = connexionSchema.safeParse({
    email: formData.get('email'),
    motDePasse: formData.get('motDePasse'),
  })

  if (!donnees.success) {
    return { error: donnees.error.issues[0]?.message ?? 'Données invalides' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: donnees.data.email,
    password: donnees.data.motDePasse,
  })

  if (error) {
    return { error: 'Email ou mot de passe incorrect.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function sInscrire(_: unknown, formData: FormData) {
  const donnees = inscriptionSchema.safeParse({
    prenom: formData.get('prenom'),
    email: formData.get('email'),
    motDePasse: formData.get('motDePasse'),
  })

  if (!donnees.success) {
    return { error: donnees.error.issues[0]?.message ?? 'Données invalides' }
  }

  const supabase = await createClient()
  const { error, data } = await supabase.auth.signUp({
    email: donnees.data.email,
    password: donnees.data.motDePasse,
    options: {
      data: { full_name: donnees.data.prenom },
    },
  })

  if (error) {
    if (error.code === 'user_already_exists') {
      return { error: 'Un compte existe déjà avec cet email.' }
    }
    return { error: `Erreur Supabase : ${error.message} (${error.code ?? 'no code'})` }
  }

  if (data.user && !data.session) {
    return { success: 'Vérifiez vos emails pour confirmer votre compte.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function seDeconnecter() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/connexion')
}
