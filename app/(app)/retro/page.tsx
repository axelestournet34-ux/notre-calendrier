import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RetroClient } from './retro-client'

interface Props { searchParams: Promise<{ annee?: string }> }

export default async function RetroPage({ searchParams }: Props) {
  const { annee } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id, couples(name, start_date)')
    .eq('user_id', user.id)
    .single() as { data: { couple_id: string; couples: { name: string; start_date: string | null } } | null }
  if (!memberRow) redirect('/onboarding')

  const now = new Date()
  const anneeNum = Number(annee) || now.getFullYear()

  const { data: souvenirs } = await supabase
    .from('memories')
    .select('date, type, lieu, memory_photos(media_type)')
    .eq('couple_id', memberRow.couple_id)
    .gte('date', `${anneeNum}-01-01`)
    .lte('date', `${anneeNum}-12-31`) as {
      data: { date: string; type: string; lieu: string | null; memory_photos: { media_type: string }[] }[] | null
    }

  const { data: humeurs } = await supabase
    .from('daily_moods')
    .select('mood')
    .eq('couple_id', memberRow.couple_id)
    .gte('date', `${anneeNum}-01-01`)
    .lte('date', `${anneeNum}-12-31`) as { data: { mood: string }[] | null }

  const liste = souvenirs ?? []
  const totalSouvenirs = liste.length
  const totalPhotos = liste.reduce((a, s) => a + s.memory_photos.filter((p) => p.media_type === 'photo').length, 0)
  const totalVideos = liste.reduce((a, s) => a + s.memory_photos.filter((p) => p.media_type === 'video').length, 0)

  const parMois = Array.from({ length: 12 }, (_, i) => liste.filter((s) => new Date(s.date).getMonth() === i).length)
  const moisMaxCount = liste.length ? Math.max(...parMois) : 0
  const moisMaxIdx = parMois.indexOf(moisMaxCount)

  const parType: Record<string, number> = {}
  liste.forEach((s) => { parType[s.type] = (parType[s.type] ?? 0) + 1 })
  const typeMax = Object.entries(parType).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const lieux = [...new Set(liste.map((s) => s.lieu).filter(Boolean))] as string[]

  const debut = memberRow.couples.start_date
    ? new Date(Math.max(new Date(memberRow.couples.start_date).getTime(), new Date(`${anneeNum}-01-01`).getTime()))
    : new Date(`${anneeNum}-01-01`)
  const fin = new Date(Math.min(new Date(`${anneeNum}-12-31`).getTime(), now.getTime()))
  const joursEnsemble = Math.max(0, Math.floor((fin.getTime() - debut.getTime()) / 86400000))

  const parHumeur: Record<string, number> = {}
  ;(humeurs ?? []).forEach((h) => { parHumeur[h.mood] = (parHumeur[h.mood] ?? 0) + 1 })
  const humeurMax = Object.entries(parHumeur).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return (
    <RetroClient
      annee={anneeNum}
      coupleName={memberRow.couples.name}
      anneePrecedente={anneeNum - 1}
      anneeSuivante={anneeNum < now.getFullYear() ? anneeNum + 1 : null}
      stats={{ totalSouvenirs, totalPhotos, totalVideos, moisMaxIdx, moisMaxCount, typeMax, lieux, joursEnsemble, humeurMax }}
    />
  )
}
