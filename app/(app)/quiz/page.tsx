import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getR2Url } from '@/lib/r2'
import { Header } from '@/components/layout/header'
import { QuizClient } from './quiz-client'

export type QuizMemory = {
  id: string
  title: string
  date: string
  photoUrl: string
}

export default async function QuizPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single()

  if (!memberRow) {
    return (
      <>
        <Header title="Quiz souvenirs" subtitle="Testez votre mémoire" />
        <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto">
          <p className="text-sm text-text-muted text-center py-10">
            Vous n'appartenez pas encore à un couple.
          </p>
        </div>
      </>
    )
  }

  type MemoryRow = { id: string; title: string; date: string; memory_photos: { storage_path: string; media_type: string }[] }
  const { data: rows } = await supabase
    .from('memories')
    .select('id, title, date, memory_photos(storage_path, media_type)')
    .eq('couple_id', memberRow.couple_id)
    .limit(200) as { data: MemoryRow[] | null }

  // Le quiz montre une photo à deviner : on ignore les souvenirs sans photo (vidéo/audio uniquement)
  const avecPhotos = (rows ?? []).filter((m) => m.memory_photos.some((p) => p.media_type === 'photo'))

  const memories: QuizMemory[] = (
    await Promise.all(
      avecPhotos.map(async (m) => {
        const path = m.memory_photos.find((p) => p.media_type === 'photo')?.storage_path
        if (!path) return null
        const photoUrl = await getR2Url(path).catch(() => null)
        if (!photoUrl) return null
        return { id: m.id, title: m.title, date: m.date, photoUrl }
      })
    )
  ).filter((m): m is QuizMemory => m !== null)

  return (
    <>
      <Header title="Quiz souvenirs" subtitle="Testez votre mémoire" />
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full">
        <QuizClient memories={memories} />
      </div>
    </>
  )
}
