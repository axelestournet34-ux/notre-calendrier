import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { DatesImportantesClient } from '@/features/dates-importantes/dates-importantes-client'

export default async function DatesImportantesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/onboarding')

  const { data: dates } = await supabase
    .from('important_dates')
    .select('*')
    .eq('couple_id', memberRow.couple_id)
    .order('date', { ascending: true }) as {
      data: {
        id: string; title: string; date: string
        type: string; recurrent: boolean; notes: string | null
      }[] | null
    }

  return (
    <>
      <Header title="Dates importantes" subtitle="Vos moments clés" />
      <DatesImportantesClient dates={dates ?? []} />
    </>
  )
}
