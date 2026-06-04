import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { NavMobile } from '@/components/layout/nav-mobile'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id, couples(*)')
    .eq('user_id', user.id)
    .single() as { data: { couple_id: string; couples: import('@/types/app.types').Couple } | null }

  const couple = memberRow?.couples ?? null

  if (!couple) redirect('/onboarding')

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar profile={profile} couple={couple} />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      <NavMobile />
    </div>
  )
}
