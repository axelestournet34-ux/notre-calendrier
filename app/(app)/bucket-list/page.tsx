import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { BucketListClient } from '@/features/bucket-list/bucket-list-client'

export default async function BucketListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/onboarding')

  const { data: items } = await supabase
    .from('bucket_list_items')
    .select('*')
    .eq('couple_id', memberRow.couple_id)
    .order('created_at', { ascending: false }) as {
      data: {
        id: string; title: string; description: string | null
        status: 'a_faire' | 'en_cours' | 'realise'
        planned_date: string | null; created_by: string; created_at: string
      }[] | null
    }

  return (
    <>
      <Header title="Bucket list" subtitle="Vos rêves à réaliser ensemble" />
      <BucketListClient items={items ?? []} userId={user.id} />
    </>
  )
}
