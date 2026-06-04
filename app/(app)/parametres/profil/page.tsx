import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { ProfilClient } from '@/features/parametres/profil-client'

export default async function ParametresProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  return (
    <>
      <Header title="Mon profil" subtitle="Vos informations personnelles" />
      <ProfilClient profile={profile} email={user.email ?? ''} />
    </>
  )
}
