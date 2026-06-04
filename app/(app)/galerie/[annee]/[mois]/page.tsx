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

  // Aplatir toutes les photos triées avec leur souvenir parent
  const allPhotos = (memories ?? []).flatMap((memory) =>
    [...memory.memory_photos]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((photo) => ({ photo, memory }))
  )

  // Générer toutes les URLs signées en parallèle
  const urls = await Promise.all(
    allPhotos.map(({ photo }) => getR2Url(photo.storage_path).catch(() => null))
  )

  const photos: {
    id: string; url: string; caption: string | null
    memoryId: string; memoryTitle: string; storagePath: string
    mediaType: string
  }[] = allPhotos
    .map(({ photo, memory }, i) =>
      urls[i]
        ? {
            id: photo.id,
            url: urls[i]!,
            caption: photo.caption,
            memoryId: memory.id,
            memoryTitle: memory.title,
            storagePath: photo.storage_path,
            mediaType: photo.media_type ?? 'photo',
          }
        : null
    )
    .filter((p): p is NonNullable<typeof p> => p !== null)

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
