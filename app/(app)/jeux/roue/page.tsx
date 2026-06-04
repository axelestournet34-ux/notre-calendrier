import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getR2Url } from '@/lib/r2'
import { Header } from '@/components/layout/header'
import { RoueClient } from './roue-client'

export type RoueMemory = {
  id: string
  title: string
  date: string
  photoUrl: string
}

export default async function RouePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/onboarding')

  type Row = { id: string; title: string; date: string; memory_photos: { storage_path: string; media_type: string }[] }
  const { data: rows } = await supabase
    .from('memories')
    .select('id, title, date, memory_photos(storage_path, media_type)')
    .eq('couple_id', memberRow.couple_id)
    .order('created_at', { ascending: false }) as { data: Row[] | null }

  const memories: RoueMemory[] = (
    await Promise.all(
      (rows ?? []).map(async (m) => {
        const path = m.memory_photos.find(p => p.media_type === 'photo')?.storage_path
        if (!path) return null
        const photoUrl = await getR2Url(path).catch(() => null)
        if (!photoUrl) return null
        return { id: m.id, title: m.title, date: m.date, photoUrl }
      })
    )
  ).filter((m): m is RoueMemory => m !== null)

  return (
    <>
      <Header title="Roue des souvenirs" subtitle="Un souvenir au hasard" />
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full">
        <RoueClient memories={memories} />
      </div>
    </>
  )
}
