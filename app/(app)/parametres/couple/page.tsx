import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { CoupleClient } from '@/features/parametres/couple-client'

export default async function ParametresCoupleePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id, role, couples(*)')
    .eq('user_id', user.id)
    .single() as {
      data: {
        couple_id: string; role: string
        couples: { id: string; name: string; start_date: string | null }
      } | null
    }

  if (!memberRow) redirect('/onboarding')

  const { data: membres } = await supabase
    .from('couple_members')
    .select('user_id, role, profiles(full_name)')
    .eq('couple_id', memberRow.couple_id) as {
      data: { user_id: string; role: string; profiles: { full_name: string | null } }[] | null
    }

  return (
    <>
      <Header title="Notre couple" subtitle="Gérez votre espace partagé" />
      <CoupleClient
        couple={memberRow.couples}
        membres={membres ?? []}
        coupleId={memberRow.couple_id}
        isOwner={memberRow.role === 'owner'}
      />
    </>
  )
}
