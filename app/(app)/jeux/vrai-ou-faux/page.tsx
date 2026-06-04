import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getR2Url } from '@/lib/r2'
import { Header } from '@/components/layout/header'
import { VraiFauxClient } from './vrai-ou-faux-client'

export type VraiFauxMemory = {
  id: string
  title: string
  date: string
  type: string
  lieu: string | null
  photoCount: number
  photoUrl: string | null
}

export default async function VraiFauxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/onboarding')

  type Row = {
    id: string; title: string; date: string; type: string; lieu: string | null
    memory_photos: { storage_path: string; media_type: string }[]
  }
  const { data: rows } = await supabase
    .from('memories')
    .select('id, title, date, type, lieu, memory_photos(storage_path, media_type)')
    .eq('couple_id', memberRow.couple_id)
    .limit(200) as { data: Row[] | null }

  const memories: VraiFauxMemory[] = await Promise.all(
    (rows ?? []).map(async (m) => {
      const photos = m.memory_photos.filter(p => p.media_type === 'photo')
      const path = photos[0]?.storage_path
      const photoUrl = path ? await getR2Url(path).catch(() => null) : null
      return {
        id: m.id,
        title: m.title,
        date: m.date,
        type: m.type,
        lieu: m.lieu,
        photoCount: photos.length,
        photoUrl,
      }
    })
  )

  return (
    <>
      <Header title="Vrai ou faux ?" subtitle="Des affirmations sur vos souvenirs" />
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full">
        <VraiFauxClient memories={memories} />
      </div>
    </>
  )
}
