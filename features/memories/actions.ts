'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { uploadToR2, deleteFromR2, getPresignedUploadUrl } from '@/lib/r2'

const souvenirSchema = z.object({
  titre:       z.string().min(1, 'Titre requis').max(200),
  date:        z.string().min(1, 'Date requise'),
  type:        z.enum(['sortie', 'voyage', 'repas', 'anniversaire', 'quotidien', 'premiere_fois', 'autre']),
  note:        z.string().max(2000).optional(),
  lieu:        z.string().max(150).optional(),
  citation:    z.string().max(500).optional(),
  chanson_url: z.string().url('URL invalide').max(500).optional().or(z.literal('')),
})

export async function obtenirUrlUpload(nomFichier: string, contentType: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' as const }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Couple introuvable' as const }

  const ext = nomFichier.split('.').pop() ?? 'bin'
  const chemin = `${memberRow.couple_id}/${crypto.randomUUID()}.${ext}`
  const url = await getPresignedUploadUrl(chemin, contentType)
  return { url, chemin }
}

export async function ajouterSouvenir(_: unknown, formData: FormData) {
  const donnees = souvenirSchema.safeParse({
    titre:       formData.get('titre'),
    date:        formData.get('date'),
    type:        formData.get('type'),
    note:        formData.get('note') || undefined,
    lieu:        formData.get('lieu') || undefined,
    citation:    formData.get('citation') || undefined,
    chanson_url: formData.get('chanson_url') || undefined,
  })

  if (!donnees.success) {
    return { error: donnees.error.issues[0]?.message ?? 'Données invalides' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Vous n\'appartenez pas à un couple.' }

  const { data: memory, error: erreurMemory } = await supabase
    .from('memories')
    .insert({
      couple_id:   memberRow.couple_id,
      author_id:   user.id,
      date:        donnees.data.date,
      title:       donnees.data.titre,
      note:        donnees.data.note ?? null,
      type:        donnees.data.type,
      lieu:        donnees.data.lieu ?? null,
      citation:    donnees.data.citation ?? null,
      chanson_url: donnees.data.chanson_url || null,
    })
    .select('id')
    .single()

  if (erreurMemory || !memory) return { error: 'Erreur lors de l\'ajout du souvenir.' }

  // Photos/audio uploadés via le serveur
  const medias = formData.getAll('medias') as File[]
  const mediasValides = medias.filter(f => f.size > 0)
  for (let i = 0; i < mediasValides.length; i++) {
    const media = mediasValides[i]
    const ext = media.name.split('.').pop() ?? 'jpg'
    const chemin = `${memberRow.couple_id}/${memory.id}/${Date.now()}-${i}.${ext}`
    const estAudio = media.type.startsWith('audio/')
    const mediaType = estAudio ? 'audio' : 'photo'
    try {
      await uploadToR2(chemin, media)
      await supabase.from('memory_photos').insert({ memory_id: memory.id, storage_path: chemin, sort_order: i, media_type: mediaType })
    } catch { }
  }

  // Vidéos uploadées directement vers R2 depuis le client (presigned URL)
  const chemins = formData.getAll('chemin') as string[]
  const mediaTypesChemin = formData.getAll('mediaType') as string[]
  for (let i = 0; i < chemins.length; i++) {
    if (!chemins[i]) continue
    await supabase.from('memory_photos').insert({
      memory_id: memory.id,
      storage_path: chemins[i],
      sort_order: mediasValides.length + i,
      media_type: (['photo', 'video', 'audio'].includes(mediaTypesChemin[i]) ? mediaTypesChemin[i] : 'photo') as 'photo' | 'video' | 'audio',
    })
  }

  await supabase.from('activity_logs').insert({
    couple_id: memberRow.couple_id,
    user_id: user.id,
    action: 'ajout_souvenir',
    resource_type: 'memory',
    resource_id: memory.id,
  })

  revalidatePath('/dashboard')
  revalidatePath('/timeline')
  redirect(`/souvenirs/${memory.id}`)
}

const modifierSouvenirSchema = z.object({
  titre:       z.string().min(1, 'Titre requis').max(200),
  date:        z.string().min(1, 'Date requise'),
  type:        z.enum(['sortie', 'voyage', 'repas', 'anniversaire', 'quotidien', 'premiere_fois', 'autre']),
  note:        z.string().max(2000).optional(),
  lieu:        z.string().max(150).optional(),
  citation:    z.string().max(500).optional(),
  chanson_url: z.string().url('URL invalide').max(500).optional().or(z.literal('')),
})

export async function modifierSouvenir(memoryId: string, _: unknown, formData: FormData) {
  const donnees = modifierSouvenirSchema.safeParse({
    titre:       formData.get('titre'),
    date:        formData.get('date'),
    type:        formData.get('type'),
    note:        formData.get('note') || undefined,
    lieu:        formData.get('lieu') || undefined,
    citation:    formData.get('citation') || undefined,
    chanson_url: formData.get('chanson_url') || undefined,
  })

  if (!donnees.success) return { error: donnees.error.issues[0]?.message ?? 'Données invalides' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase
    .from('memories')
    .update({
      date:        donnees.data.date,
      title:       donnees.data.titre,
      note:        donnees.data.note ?? null,
      type:        donnees.data.type,
      lieu:        donnees.data.lieu ?? null,
      citation:    donnees.data.citation ?? null,
      chanson_url: donnees.data.chanson_url || null,
    })
    .eq('id', memoryId).eq('author_id', user.id)

  if (error) return { error: 'Erreur lors de la modification.' }

  // Nouvelles photos uploadées directement vers R2
  const chemins = formData.getAll('chemin') as string[]
  const mediaTypes = formData.getAll('mediaType') as string[]
  const nbExistantes = Number(formData.get('nbPhotosExistantes') ?? 0)

  for (let i = 0; i < chemins.length; i++) {
    if (!chemins[i]) continue
    await supabase.from('memory_photos').insert({
      memory_id:    memoryId,
      storage_path: chemins[i],
      sort_order:   nbExistantes + i,
      media_type:   (['photo', 'video', 'audio'].includes(mediaTypes[i]) ? mediaTypes[i] : 'photo') as 'photo' | 'video' | 'audio',
    })
  }

  revalidatePath(`/souvenirs/${memoryId}`)
  revalidatePath('/dashboard')
  revalidatePath('/timeline')
  redirect(`/souvenirs/${memoryId}`)
}

export async function supprimerPhotoSouvenir(photoId: string, storagePath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  await deleteFromR2(storagePath).catch(() => {})
  await supabase.from('memory_photos').delete().eq('id', photoId)
  return null
}

export async function supprimerSouvenir(memoryId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  // Supprimer les fichiers de R2 avant la suppression DB
  const { data: photos } = await supabase
    .from('memory_photos').select('storage_path').eq('memory_id', memoryId)

  await Promise.all((photos ?? []).map(p => deleteFromR2(p.storage_path)))

  await supabase.from('memories').delete().eq('id', memoryId).eq('author_id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/timeline')
  redirect('/dashboard')
}
