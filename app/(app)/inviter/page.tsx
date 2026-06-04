import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { InviterClient } from './inviter-client'

export default async function InviterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single()

  if (!memberRow) redirect('/onboarding')

  const { data, error } = await supabase
    .from('couple_invitations')
    .insert({ couple_id: memberRow.couple_id, invited_by: user.id })
    .select('token')
    .single()

  if (error || !data) {
    return (
      <>
        <Header title="Inviter Fanny" />
        <div className="px-4 py-8 text-center">
          <p className="text-red-500 text-sm">Erreur : {error?.message ?? 'inconnue'}</p>
        </div>
      </>
    )
  }

  const code = data.token.substring(0, 8).toUpperCase()

  return (
    <>
      <Header title="Inviter Fanny" subtitle="Code valable 7 jours" />
      <InviterClient code={code} />
    </>
  )
}
