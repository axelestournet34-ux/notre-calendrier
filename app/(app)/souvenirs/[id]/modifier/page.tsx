import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getR2Url } from '@/lib/r2'
import { Header } from '@/components/layout/header'
import { ModifierForm } from './modifier-form'

interface Props { params: Promise<{ id: string }> }

export default async function ModifierSouvenirPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: souvenir } = await supabase
    .from('memories')
    .select('*, memory_photos(*)')
    .eq('id', id)
    .eq('author_id', user.id)
    .single() as {
      data: {
        id: string; title: string; date: string; type: string
        note: string | null; lieu: string | null
        citation: string | null; chanson_url: string | null
        memory_photos: { id: string; storage_path: string; media_type: string; sort_order: number }[]
      } | null
    }

  if (!souvenir) notFound()

  const photos = await Promise.all(
    (souvenir.memory_photos ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(async (p) => ({
        id: p.id,
        storagePath: p.storage_path,
        mediaType: p.media_type,
        url: await getR2Url(p.storage_path).catch(() => null),
      }))
  )

  return (
    <>
      <Header title="Modifier le souvenir" subtitle="Apportez vos corrections" />
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full">
        <ModifierForm souvenir={souvenir} photos={photos} />
      </div>
    </>
  )
}
