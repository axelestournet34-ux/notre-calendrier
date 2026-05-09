import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { CapsulesClient } from '@/features/capsules/capsules-client'

export default async function CapsulesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/onboarding')

  const { data: capsules } = await supabase
    .from('time_capsules')
    .select('*, profiles(full_name)')
    .eq('couple_id', memberRow.couple_id)
    .order('open_date', { ascending: true }) as {
      data: {
        id: string; title: string; content: string
        open_date: string; opened_at: string | null
        created_by: string; created_at: string
        profiles: { full_name: string | null }
      }[] | null
    }

  return (
    <>
      <Header title="Capsules temporelles" subtitle="Des messages pour le futur" />
      <CapsulesClient capsules={capsules ?? []} userId={user.id} />
    </>
  )
}
