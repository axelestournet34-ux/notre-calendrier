import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { getR2Url } from '@/lib/r2'
import { Header } from '@/components/layout/header'
import { GalerieClient } from '@/features/gallery/galerie-client'

interface Props {
  params: Promise<{ annee: string; mois: string }>
}

export default async function GaleriePage({ params }: Props) {
  const { annee, mois } = await params
  const anneeNum = Number(annee)
  const moisNum = Number(mois)

  if (isNaN(anneeNum) || isNaN(moisNum) || moisNum < 1 || moisNum > 12) {
    redirect('/galerie')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/onboarding')

  const dateActuelle = new Date(anneeNum, moisNum - 1, 1)
  const debutMois = format(dateActuelle, 'yyyy-MM-01')
  const finMois = format(new Date(anneeNum, moisNum, 0), 'yyyy-MM-dd')
  const titre = format(dateActuelle, 'MMMM yyyy', { locale: fr })

  // Navigation
  const moisPrecedent = new Date(anneeNum, moisNum - 2, 1)
  const moisSuivant = new Date(anneeNum, moisNum, 1)

  // Toutes les photos du mois avec leur souvenir
  const { data: memories } = await supabase
    .from('memories')
    .select('id, title, date, memory_photos(id, storage_path, caption, sort_order)')
    .eq('couple_id', memberRow.couple_id)
    .gte('date', debutMois)
    .lte('date', finMois)
    .order('date', { ascending: false }) as {
      data: {
        id: string; title: string; date: string
        memory_photos: { id: string; storage_path: string; caption: string | null; sort_order: number; media_type: string }[]
      }[] | null
    }

  // Génération des URLs signées côté serveur
  const photos: {
    id: string; url: string; caption: string | null
    memoryId: string; memoryTitle: string; storagePath: string
    mediaType: string
  }[] = []

  for (const memory of memories ?? []) {
    const sorted = [...memory.memory_photos].sort((a, b) => a.sort_order - b.sort_order)
    for (const photo of sorted) {
      const url = await getR2Url(photo.storage_path).catch(() => null)
      if (url) {
        photos.push({
          id: photo.id,
          url,
          caption: photo.caption,
          memoryId: memory.id,
          memoryTitle: memory.title,
          storagePath: photo.storage_path,
          mediaType: photo.media_type ?? 'photo',
        })
      }
    }
  }

  const navPrecedent = `/galerie/${format(moisPrecedent, 'yyyy')}/${format(moisPrecedent, 'M')}`
  const navSuivant = `/galerie/${format(moisSuivant, 'yyyy')}/${format(moisSuivant, 'M')}`

  return (
    <>
      <Header title="Galerie" subtitle={titre} />
      <GalerieClient
        photos={photos}
        titre={titre}
        navPrecedent={navPrecedent}
        navSuivant={navSuivant}
        moisPrecedentLabel={format(moisPrecedent, 'MMM', { locale: fr })}
        moisSuivantLabel={format(moisSuivant, 'MMM', { locale: fr })}
      />
    </>
  )
}
