import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Header } from '@/components/layout/header'
import { GalerieClient } from '@/features/gallery/galerie-client'
import { DEMO_MEMORIES } from '@/lib/demo-data'

export function generateStaticParams() {
  const mois = [...new Set(DEMO_MEMORIES.map((m) => m.date.slice(0, 7)))]
  return mois.map((ym) => {
    const [annee, moisNum] = ym.split('-')
    return { annee, mois: String(Number(moisNum)) }
  })
}

interface Props {
  params: Promise<{ annee: string; mois: string }>
}

export default async function GaleriePage({ params }: Props) {
  const { annee, mois } = await params
  const anneeNum = Number(annee)
  const moisNum = Number(mois)

  const dateActuelle = new Date(anneeNum, moisNum - 1, 1)
  const titre = format(dateActuelle, 'MMMM yyyy', { locale: fr })

  const moisPrecedent = new Date(anneeNum, moisNum - 2, 1)
  const moisSuivant = new Date(anneeNum, moisNum, 1)

  // Filtrer les souvenirs du mois demandé
  const debutMois = `${annee}-${String(moisNum).padStart(2, '0')}-01`
  const finMoisDate = new Date(anneeNum, moisNum, 0)
  const finMois = `${annee}-${String(moisNum).padStart(2, '0')}-${String(finMoisDate.getDate()).padStart(2, '0')}`

  const memoriesDuMois = DEMO_MEMORIES.filter((m) => m.date >= debutMois && m.date <= finMois)

  // Si le mois est vide, prendre tous les souvenirs (pour la démo)
  const source = memoriesDuMois.length > 0 ? memoriesDuMois : DEMO_MEMORIES

  const photos = source.flatMap((m) =>
    m.photos.map((p) => ({
      id: p.id,
      url: p.url,
      caption: p.caption,
      memoryId: m.id,
      memoryTitle: m.title,
      storagePath: p.url,
      mediaType: p.media_type,
    }))
  )

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
